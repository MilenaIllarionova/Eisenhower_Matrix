import { create } from 'zustand';
import { tasksApi, CreateTaskInput } from '../services/tasks';
import { Task, Quadrant, QUADRANTS } from '../types';

type ByQuadrant = Record<Quadrant, Task[]>;

const emptyMatrix = (): ByQuadrant => ({
  urgent_important: [],
  important_not_urgent: [],
  urgent_not_important: [],
  not_urgent_not_important: [],
});

interface TasksState {
  tasks: Task[];
  matrix: ByQuadrant;
  trash: Task[];
  loading: boolean;
  error?: string;
  fetchAll: (teamId?: string, projectId?: string) => Promise<void>;
  fetchTrash: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  moveTask: (taskId: string, quadrant: Quadrant) => Promise<void>;
  updateTask: (taskId: string, patch: Partial<CreateTaskInput>) => Promise<void>;
  /** Soft-delete — задача уходит в корзину. */
  removeTask: (taskId: string) => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
  purgeTask: (taskId: string) => Promise<void>;
}

function groupByQuadrant(tasks: Task[]): ByQuadrant {
  const grouped = emptyMatrix();
  for (const t of tasks) grouped[t.quadrant]?.push(t);
  return grouped;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  matrix: emptyMatrix(),
  trash: [],
  loading: false,
  fetchAll: async (teamId, projectId) => {
  set({ loading: true, error: undefined });
  try {
    const tasks = await tasksApi.list({ teamId, projectId });
    set({ tasks, matrix: groupByQuadrant(tasks), loading: false });
  } catch (err: any) {
    set({ loading: false, error: err?.response?.data?.message ?? 'Не удалось загрузить задачи' });
  }
},
  fetchTrash: async () => {
    try {
      const trash = await tasksApi.list({ trashed: true });
      set({ trash });
    } catch {
      set({ trash: [] });
    }
  },
  createTask: async (input) => {
    const task = await tasksApi.create(input);
    const tasks = [task, ...get().tasks];
    set({ tasks, matrix: groupByQuadrant(tasks) });
    return task;
  },
  moveTask: async (taskId, quadrant) => {
    if (!QUADRANTS.includes(quadrant)) return;
    const current = get().tasks.find((t) => t.id === taskId);
    if (!current || current.quadrant === quadrant) return;

    const optimistic = get().tasks.map((t) =>
      t.id === taskId ? { ...t, quadrant } : t,
    );
    set({ tasks: optimistic, matrix: groupByQuadrant(optimistic) });

    try {
      const updated = await tasksApi.update(taskId, { quadrant });
      const tasks = get().tasks.map((t) => (t.id === taskId ? updated : t));
      set({ tasks, matrix: groupByQuadrant(tasks) });
    } catch {
      // rollback
      const rollback = get().tasks.map((t) =>
        t.id === taskId ? { ...t, quadrant: current.quadrant } : t,
      );
      set({ tasks: rollback, matrix: groupByQuadrant(rollback), error: 'Не удалось переместить задачу' });
    }
  },
  updateTask: async (taskId, patch) => {
    const updated = await tasksApi.update(taskId, patch);
    // Если задача стала done → переезжает в корзину
    if (updated.status === 'done') {
      const tasks = get().tasks.filter((t) => t.id !== taskId);
      const trash = [updated, ...get().trash.filter((t) => t.id !== taskId)];
      set({ tasks, matrix: groupByQuadrant(tasks), trash });
    } else {
      const tasks = get().tasks.map((t) => (t.id === taskId ? updated : t));
      set({ tasks, matrix: groupByQuadrant(tasks) });
    }
  },
  removeTask: async (taskId) => {
    const task = await tasksApi.remove(taskId);
    const tasks = get().tasks.filter((t) => t.id !== taskId);
    const trash = [task, ...get().trash.filter((t) => t.id !== taskId)];
    set({ tasks, matrix: groupByQuadrant(tasks), trash });
  },
  restoreTask: async (taskId) => {
    const restored = await tasksApi.restore(taskId);
    const trash = get().trash.filter((t) => t.id !== taskId);
    const tasks = [restored, ...get().tasks];
    set({ tasks, matrix: groupByQuadrant(tasks), trash });
  },
  purgeTask: async (taskId) => {
    await tasksApi.purge(taskId);
    const trash = get().trash.filter((t) => t.id !== taskId);
    set({ trash });
  },
}));
