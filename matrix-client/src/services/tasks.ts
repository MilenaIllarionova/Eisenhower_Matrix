import { api } from './api';
import { Quadrant, Task, TaskStatus } from '../types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  quadrant: Quadrant;
  status?: TaskStatus;
  deadline?: string;
  assigneeId?: string;
  projectId?: string;
  teamId?: string;
}

export interface ListTasksFilter {
  teamId?: string;
  projectId?: string;
  assigneeId?: string;
  quadrant?: Quadrant;
  status?: TaskStatus;
  /** true → корзина: выполненные или soft-deleted */
  trashed?: boolean;
}

export const tasksApi = {
  list: (filter: ListTasksFilter = {}) => {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([k, v]) => {
      if (v === undefined || v === false) return;
      params[k] = String(v);
    });
    return api.get<{ tasks: Task[] }>('/tasks', { params }).then((r) => r.data.tasks);
  },
  matrix: (filter: Pick<ListTasksFilter, 'teamId' | 'projectId'> = {}) =>
    api
      .get<{ matrix: Record<Quadrant, Task[]> }>('/tasks/matrix', { params: filter })
      .then((r) => r.data.matrix),
  create: (input: CreateTaskInput) =>
    api.post<{ task: Task }>('/tasks', input).then((r) => r.data.task),
  update: (id: string, patch: Partial<CreateTaskInput>) =>
    api.patch<{ task: Task }>(`/tasks/${id}`, patch).then((r) => r.data.task),
  /** Soft-delete: задача отправляется в корзину. */
  remove: (id: string) => api.delete<{ task: Task }>(`/tasks/${id}`).then((r) => r.data.task),
  /** Восстановить задачу из корзины. */
  restore: (id: string) =>
    api.post<{ task: Task }>(`/tasks/${id}/restore`).then((r) => r.data.task),
  /** Окончательно удалить задачу (без возможности восстановить). */
  purge: (id: string) => api.delete(`/tasks/${id}/purge`).then((r) => r.data),
};
