# Matrix — server

Backend веб-приложения для совместного планирования задач с матрицей Эйзенхауэра.
REST API + Socket.IO, JWT-аутентификация, MongoDB.

## Стек

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Socket.IO (realtime-уведомления)
- Zod (валидация входных данных)

## Структура папок

```
src/
├── app.ts                 — сборка Express-приложения
├── server.ts              — точка входа (HTTP + Socket.IO)
├── config/
│   ├── db.ts              — подключение к MongoDB
│   └── env.ts             — переменные окружения
├── controllers/           — слой HTTP-обработчиков
├── middleware/
│   ├── auth.ts            — verifyToken (JWT)
│   ├── errorHandler.ts    — единый обработчик ошибок
│   ├── notFound.ts
│   └── validate.ts        — Zod-валидация
├── models/                — Mongoose: User, Task, Project, ProjectMember, Team, TeamMember, Notification
├── routes/                — REST-маршруты
├── services/              — бизнес-логика (auth, task, project, team, notification)
├── sockets/               — Socket.IO (emitToUser / emitToTeam)
├── types/                 — расширение типов Express
└── utils/                 — HttpError и хелперы
```

## Модели

- **User** — учётная запись (email, passwordHash, name, avatarUrl).
- **Project** — «доска» в терминах UI; владелец `ownerId`.
- **ProjectMember** — связь User↔Project с ролью `'admin' | 'member' | 'viewer'`. Уникальный индекс `(projectId, userId)`.
- **Task** — название, описание, `quadrant`, `status: 'todo'|'in_progress'|'on_hold'|'review'|'done'`, `deadline`, `assigneeId`, `projectId`, `teamId`, `createdBy`, `history[]`.
- **Team / TeamMember** — командное пространство (для группировки нескольких досок).
- **Notification** — типы: `task_assigned`, `task_quadrant_changed`, `task_status_changed`, `task_deadline_soon`, `task_review_requested`, `task_completed`, `team_invited`, `team_joined`, `project_invited`.

## REST API

| Метод  | Путь                              | Описание                                                       |
|--------|-----------------------------------|----------------------------------------------------------------|
| POST   | /api/auth/register                | Регистрация                                                    |
| POST   | /api/auth/login                   | Вход, возвращает JWT                                           |
| GET    | /api/auth/me                      | Текущий пользователь                                           |
| GET    | /api/users/search?q=              | Поиск пользователей по имени/email                             |
| GET    | /api/tasks                        | Список задач (фильтры в query)                                 |
| GET    | /api/tasks/matrix                 | Группировка по квадрантам                                      |
| POST   | /api/tasks                        | Создание задачи                                                |
| GET    | /api/tasks/:id                    | Получение задачи                                               |
| PATCH  | /api/tasks/:id                    | Обновление (включая `quadrant` для DnD и `status` для workflow)|
| DELETE | /api/tasks/:id                    | Удаление                                                       |
| GET    | /api/projects                     | Доски, где пользователь — участник                             |
| POST   | /api/projects                     | Создание доски + опциональные `memberInvites`                  |
| GET    | /api/projects/:id/members         | Участники доски                                                |
| POST   | /api/projects/:id/invite          | Пригласить по email (тело: `{ email, role }`)                  |
| PATCH  | /api/projects/:id                 | Редактирование доски                                           |
| GET    | /api/teams                        | Команды пользователя                                           |
| POST   | /api/teams                        | Создание команды                                               |
| GET    | /api/teams/:id                    | Команда + участники                                            |
| POST   | /api/teams/:id/invite             | Приглашение в команду                                          |
| PATCH  | /api/teams/:id/members/:userId    | Смена роли                                                     |
| DELETE | /api/teams/:id/members/:userId    | Удаление участника                                             |
| GET    | /api/notifications                | Лента уведомлений                                              |
| POST   | /api/notifications/:id/read       | Отметить прочитанным                                           |
| POST   | /api/notifications/read-all       | Отметить всё прочитанным                                       |

### Workflow «На проверке → Выполнено»

1. Исполнитель в детальной модалке нажимает «Выполнено» → `PATCH /tasks/:id { status: 'review' }`.
2. Сервис `updateTask` детектирует переход `prevStatus → 'review'` и шлёт `task_review_requested` владельцу доски (`project.ownerId`).
3. Владелец проверяет задачу и переводит её в `'done'` → исполнителю приходит `task_completed`.

### Делегирование

`PATCH /tasks/:id { assigneeId: '<userId>' }` — при изменении исполнителя сервис автоматически создаёт `task_assigned` и эмитит его через Socket.IO в комнату `user:<userId>`.

## Socket.IO

- Аутентификация: `socket.auth.token` (JWT).
- При подключении сокет автоматически попадает в комнату `user:<id>`.
- Events:
  - сервер → клиент: `notification:new` (любое серверное уведомление)
  - клиент → сервер: `team:join` / `team:leave`

## Запуск

```bash
cp .env.example .env       # MONGODB_URI, JWT_SECRET
npm install
npm run dev                # PORT (по умолчанию 4000)
```

Production:

```bash
npm run build
npm start
```

Требуется MongoDB (локальная или MongoDB Atlas).
