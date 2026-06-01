import { useNavigate } from 'react-router-dom';
import { isSameDay } from 'date-fns';
import { Task } from '../../types';

interface Props {
  date: Date;
  tasks: Task[];
}

const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08..21

/** Дневное представление: список часов слева, задачи — блоки на нужных часах. */
export default function CalendarDay({ date, tasks }: Props) {
  const navigate = useNavigate();

  const goToTask = (task: Task) =>
    task.projectId
      ? navigate(`/tasks?boardId=${task.projectId}&taskId=${task.id}`)
      : navigate(`/tasks?taskId=${task.id}`);

  const dayTasks = tasks.filter(
    (tk) => tk.deadline && isSameDay(new Date(tk.deadline), date),
  );

  return (
    <div className="bg-bg-panel rounded-2xl p-4 h-full overflow-y-auto scrollbar-thin">
      <div className="grid" style={{ gridTemplateColumns: '80px 1fr' }}>
        {HOURS.map((h) => {
          const slot = dayTasks.find((tk) => new Date(tk.deadline!).getHours() === h);
          return (
            <div key={h} className="contents">
              <div className="text-xs text-white/60 px-2 py-3 border-t border-white/10">
                {String(h).padStart(2, '0')}:00
              </div>
              <div className="border-t border-white/10 min-h-[44px] py-1 pl-2">
                {slot && (
                  <button
                    type="button"
                    onClick={() => goToTask(slot)}
                    className="text-left text-sm bg-red-400/90 hover:bg-red-400 text-bg rounded-md px-3 py-2 w-full"
                  >
                    <div className="font-semibold">{slot.title}</div>
                    {slot.description && (
                      <div className="text-xs opacity-80 truncate">{slot.description}</div>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
