# Matrix — client

Веб-клиент для совместного планирования задач с матрицей Эйзенхауэра.
SPA на React 18 + TypeScript. Полностью на русском.

## Стек

- Vite + React 18 + TypeScript
- Tailwind CSS (тёмная тема, кастомная палитра «Matrix»)
- React Router 6
- Zustand (auth + tasks + projects + toasts)
- Axios + Socket.IO client (входящие уведомления → тосты)
- @dnd-kit/core — drag-and-drop матрицы
- date-fns + собственный модуль `i18n/ru.ts` для дат

## Структура

```
src/
├── App.tsx                       — роутинг + ToastHost
├── main.tsx
├── i18n/ru.ts                    — централизованные строки и форматтеры дат
├── styles/index.css              — Tailwind + утилитарные классы (input-pill, btn-accent, slide-indicator…)
├── pages/
│   ├── LoginPage.tsx / SignupPage.tsx   — анимированные табы «Вход»/«Регистрация»
│   ├── BoardsPage.tsx                   — главная (Привет!), доски, Крайний срок, Задачи, Друзья
│   ├── DeadlinePage.tsx                 — календарь Месяц / Неделя / День
│   ├── MatrixPage.tsx                   — матрица Эйзенхауэра с DnD + ?boardId
│   ├── ProfilePage.tsx                  — профиль пользователя
│   └── SettingsPage.tsx
├── components/
│   ├── layout/                          — AppShell (Socket.IO → тосты), Sidebar (анимированный язычок), TopBar
│   ├── auth/                            — AuthLayout (sliding-таб), OAuthRow
│   ├── boards/                          — BoardCard (кликабельный), BoardFormModal (с ролями),
│   │                                       TaskFormModal (с burning-flag), AddFriendModal,
│   │                                       SidePanel, TaskList, FriendsRow
│   ├── deadline/                        — CalendarGrid (Месяц), CalendarWeek, CalendarDay
│   ├── matrix/                          — Quadrant, MatrixCard (клик → детальная модалка),
│   │                                       FilterPanel, WeekStrip,
│   │                                       TaskDetailModal (Выполнено/Сохранить/Отмена),
│   │                                       AssigneePickerModal
│   └── common/                          — Icons, BigModal, Modal, ViewToggle (sliding),
│                                          DatePager, SearchBar, ToastHost
├── services/                            — api, auth, tasks, projects, users, socket
├── store/                               — useAuthStore, useTasksStore, useProjectsStore, useToastStore
└── types/index.ts                       — общие типы, словари (QUADRANT_LABEL, STATUS_LABEL, PROJECT_ROLE_LABEL)
```

## Запуск

```bash
cp .env.example .env          # при необходимости задать VITE_API_URL
npm install
npm run dev                   # http://localhost:5173
```

`vite.config.ts` уже проксирует `/api` и `/socket.io` на `http://localhost:4000`. Для другого хоста — переопределите `VITE_API_URL`.

## Поведения по экранам

### Вход / Регистрация
- Тёмная карточка-«язычок» с активной надписью плавно скользит между «ВХОД» и «РЕГИСТРАЦИЯ» (`AuthLayout.tsx`).
- Поля: имя (только регистрация), email, пароль; ошибки выводятся под формой.

### Боковое меню
- Точно такая же анимация: тёмная капсула с подсветкой активного пункта скользит между Доски / Сроки / Задачи / Настройки.

### Доски
- Поиск (`SearchBar`) ищет одновременно по доскам, локально загруженным задачам и серверным пользователям. Найденный участник раскрывает список своих задач — клик ведёт на задачу.
- Клик по карточке доски — `/tasks?boardId=...` (матрица доски).
- Кнопки «+» открывают модалки: доски, задачи (для «Крайний срок» — с авто-сегодня), друзей.

### Сроки
- `ViewToggle` со sliding-индикатором переключает три представления (месяц / неделя / день).
- Клик по любой задаче — `/tasks?boardId=…&taskId=…` (откроется детальная модалка).

### Матрица
- DnD между квадрантами через `@dnd-kit`; оптимистичный апдейт + `PATCH /tasks/:id`.
- Клик по карточке — `TaskDetailModal`.
- В модалке: смена исполнителя в `AssigneePickerModal` сразу синхронизируется и шлёт тост-уведомление.
- Кнопка «Выполнено» переводит задачу в статус `review`; владельцу доски приходит уведомление через Socket.IO.

### Тосты
- `ToastHost` в правом нижнем углу подписан на сокет; локальные действия тоже могут пушить тосты (`useToastStore.push`).

## Соответствие плану ВКР

- 3.2.1 Структура React-приложения — pages / components / services / store / i18n.
- 3.2.2 Управление состоянием — четыре Zustand-стора (auth, tasks, projects, toasts).
- 3.2.3 Матрица Эйзенхауэра + DnD — реализовано через `@dnd-kit`.
- 3.2.4 Ключевые страницы — Login, Signup, Boards, Deadline, Matrix, Profile, Settings.
- 3.2.5 HTTP-клиент — axios с JWT-перехватчиком и автологаутом при 401; Socket.IO-клиент авторизуется тем же токеном.
