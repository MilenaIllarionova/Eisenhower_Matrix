import { TaskStatus } from '../../types';
import { t } from '../../i18n/ru';

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'Предстоящие' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Выполнено' },
];

interface Props {
  selected: Set<TaskStatus>;
  onToggle: (status: TaskStatus) => void;
}

export default function FilterPanel({ selected, onToggle }: Props) {
  return (
    <div className="panel">
      <h3 className="text-lg font-semibold text-white mb-4">{t.matrix.filter}</h3>
      <ul className="flex flex-col gap-2">
        {statuses.map((s) => (
          <li key={s.value}>
            <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(s.value)}
                onChange={() => onToggle(s.value)}
                className="w-4 h-4 rounded border-white/20 accent-accent"
              />
              {s.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
