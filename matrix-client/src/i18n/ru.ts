// Централизованные строки RU. Импортируем из компонентов вместо хардкода.
export const t = {
  app: { title: 'Matrix' },
  auth: {
    login: 'Вход',
    signup: 'Регистрация',
    loginUpper: 'ВХОД',
    signupUpper: 'РЕГИСТРАЦИЯ',
    name: 'Имя',
    email: 'Email',
    password: 'Пароль',
    submitLogin: 'ВОЙТИ',
    submitSignup: 'ЗАРЕГИСТРИРОВАТЬСЯ',
    forgot: 'Забыли пароль?',
    or: 'Войти с помощью',
    hasAccount: 'Уже есть аккаунт?',
    noAccount: 'Нет аккаунта?',
    loginFailed: 'Не удалось войти',
    signupFailed: 'Не удалось зарегистрироваться',
  },
  nav: {
    boards: 'ДОСКИ',
    deadline: 'СРОКИ',
    tasks: 'ЗАДАЧИ',
    settings: 'НАСТРОЙКИ',
    logout: 'ВЫЙТИ',
  },
  common: {
    save: 'Сохранить',
    saveUpper: 'СОХРАНИТЬ',
    cancel: 'Отмена',
    cancelUpper: 'ОТМЕНА',
    delete: 'Удалить',
    add: 'Добавить',
    addBoard: 'Добавить новую доску',
    addTask: 'Добавить новую задачу',
    today: 'Сегодня',
    search: 'Введите название доски или задачи',
    searchMember: 'Поиск участников',
    optional: 'необязательно',
    done: 'Выполнено',
    join: 'Присоединиться',
  },
  boards: {
    title: 'Мои доски',
    boardName: 'Название доски',
    boardDescription: 'Описание',
    boardNamePh: 'Введите название доски',
    boardDescPh: 'Введите описание доски',
    addMembers: 'Добавить участников',
    canAddLater: 'Вы можете добавить участников позже',
    participantsTasks: 'участников | задач',
    burning: 'Крайний срок',
    todo: 'Задачи',
    friends: 'Друзья',
    boardsEmpty: 'Пока нет досок — нажмите «+» и создайте первую',
  },
  taskForm: {
    title: 'Название задачи',
    titlePh: 'Введите название задачи',
    description: 'Описание',
    descriptionPh: 'Введите описание задачи',
    deadline: 'Срок',
    priority: 'Приоритет',
    board: 'Доска',
    pickDate: 'Выберите дату',
    pickBoard: 'Выберите доску',
    today: 'Сегодня',
    assignee: 'Исполнитель',
    pickAssignee: 'Выберите участника',
    noBoard: 'Без доски (личная задача)',
  },
  matrix: {
    filter: 'Фильтр',
    members: 'Участники доски',
    dropHere: 'Перетащите задачи сюда',
  },
  deadline: {
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
  },
  profile: {
    title: 'Профиль',
    name: 'Имя',
    email: 'Email',
    memberSince: 'Зарегистрирован',
    teams: 'Команды',
    boards: 'Доски',
    edit: 'Редактировать',
  },
  search: {
    boards: 'Доски',
    tasks: 'Задачи',
    members: 'Участники',
    membersTasks: 'Задачи участника',
    nothing: 'Ничего не найдено',
  },
} as const;

export const WEEKDAYS_SHORT_RU = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
export const WEEKDAYS_LONG_RU = [
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
  'воскресенье',
];
export const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];
export const MONTHS_GEN_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function formatDateRu(date: Date): string {
  return `${date.getDate()} ${MONTHS_GEN_RU[date.getMonth()]} ${date.getFullYear()}`;
}
export function formatDateLongRu(date: Date): string {
  return `${date.getDate()} ${MONTHS_GEN_RU[date.getMonth()]} ${date.getFullYear()}, ${WEEKDAYS_LONG_RU[(date.getDay() + 6) % 7]}`;
}
export function formatMonthRu(date: Date): string {
  const m = MONTHS_RU[date.getMonth()];
  return `${m[0].toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}
