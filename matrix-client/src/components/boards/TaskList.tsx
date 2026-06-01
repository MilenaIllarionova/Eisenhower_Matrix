import { Task } from '../../types';

interface Props {
  tasks: Task[];
  variant?: 'burning' | 'todo';
  emptyText?: string;
  onToggle?: (task: Task) => void;
}

export default function TaskList({ tasks, variant = 'todo', emptyText = 'Нет задач', onToggle }: Props) {
  if (tasks.length === 0) {
    return <p className="text-sm text-white/40 py-4">{emptyText}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3">
          {variant === 'burning' ? (
            <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden />
          ) : (
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => onToggle?.(task)}
              className="w-4 h-4 rounded border-white/30 bg-transparent accent-accent"
            />
          )}
          <div className="bg-white text-bg text-sm rounded-full px-4 py-1.5 flex-1 truncate">
            {task.title}
          </div>
        </li>
      ))}
    </ul>
  );
}
