import { useEffect } from 'react';
import { useTasksStore } from '../../store/useTasksStore';
import { useToastStore } from '../../store/useToastStore';
import { Task } from '../../types';

interface Props {
  /** Ограничить корзину одной доской. Если не указан — все задачи пользователя. */
  boardId?: string;
}

/**
 * Корзина: показывает выполненные (status='done') и soft-deleted задачи.
 * Позволяет восстановить или окончательно удалить.
 */
export default function TrashPanel({ boardId }: Props) {
  const { trash, fetchTrash, restoreTask, purgeTask } = useTasksStore();
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    fetchTrash().catch(() => undefined);
  }, [fetchTrash]);

  const list = boardId ? trash.filter((t) => t.projectId === boardId) : trash;

  const handleRestore = async (task: Task) => {
    await restoreTask(task.id);
    pushToast({ title: 'Восстановлено', body: `«${task.title}» возвращена в работу` });
  };

  const handlePurge = async (task: Task) => {
    if (!confirm(`Удалить «${task.title}» безвозвратно?`)) return;
    await purgeTask(task.id);
    pushToast({ title: 'Удалено', body: `«${task.title}» удалена окончательно` });
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span aria-hidden>🗑</span> Корзина
        </h3>
        <span className="text-xs text-white/40">{list.length}</span>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-white/40 py-2">Корзина пуста</p>
      ) : (
        <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {list.map((tk) => (
            <li
              key={tk.id}
              className="bg-bg-card rounded-xl px-3 py-2 flex items-center justify-between gap-2"
            >
              <span className="text-sm text-white truncate flex-1" title={tk.title}>
                {tk.title}
                {tk.status === 'done' && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-300/70">
                    выполнено
                  </span>
                )}
              </span>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRestore(tk)}
                  aria-label="Восстановить"
                  title="Восстановить"
                  className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center text-xs hover:bg-accent-dark"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() => handlePurge(tk)}
                  aria-label="Удалить навсегда"
                  title="Удалить навсегда"
                  className="w-7 h-7 rounded-full bg-red-500/30 text-red-200 hover:bg-red-500/50 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
