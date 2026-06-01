export type Quadrant =
  | 'urgent_important'
  | 'important_not_urgent'
  | 'urgent_not_important'
  | 'not_urgent_not_important';

export type TaskStatus = 'todo' | 'in_progress' | 'on_hold' | 'review' | 'done';

export const QUADRANTS: Quadrant[] = [
  'urgent_important',
  'important_not_urgent',
  'urgent_not_important',
  'not_urgent_not_important',
];

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  urgent_important: 'Важное и срочное',
  important_not_urgent: 'Важное, но не срочное',
  urgent_not_important: 'Не важное, но срочное',
  not_urgent_not_important: 'Не важное и не срочное',
};

export const QUADRANT_SHORT: Record<Quadrant, string> = {
  urgent_important: 'Важное и срочное',
  important_not_urgent: 'Важное, но не срочное',
  urgent_not_important: 'Срочное, не важное',
  not_urgent_not_important: 'Не важное и не срочное',
};

export const QUADRANT_COLOR: Record<Quadrant, string> = {
  urgent_important: 'bg-quadrant-urgentImportant',
  important_not_urgent: 'bg-quadrant-importantNotUrgent',
  urgent_not_important: 'bg-quadrant-urgentNotImportant',
  not_urgent_not_important: 'bg-quadrant-notUrgent',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'Предстоящие',
  in_progress: 'В процессе',
  on_hold: 'На паузе',
  review: 'На проверке',
  done: 'Выполнено',
};

export type ProjectRole = 'admin' | 'member' | 'viewer';

export const PROJECT_ROLE_LABEL: Record<ProjectRole, string> = {
  admin: 'Администратор',
  member: 'Участник',
  viewer: 'Наблюдатель',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  status: TaskStatus;
  deadline?: string;
  assigneeId?: string;
  projectId?: string;
  teamId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  teamId?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: { done: number; total: number }; // добавить
  membersCount?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: User | string;
  role: ProjectRole;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

export type TeamRole = 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: User | string;
  role: TeamRole;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  taskId?: string;
  teamId?: string;
  createdAt: string;
}
