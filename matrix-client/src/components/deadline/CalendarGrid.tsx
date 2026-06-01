import { useNavigate } from 'react-router-dom';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Task } from '../../types';
import { WEEKDAYS_SHORT_RU } from '../../i18n/ru';

interface Props {
  month: Date;
  tasks: Task[];
}

const palette = [
  'bg-amber-500/70',
  'bg-red-500/70',
  'bg-emerald-500/70',
  'bg-sky-500/70',
  'bg-violet-500/70',
];

function colorFor(taskId: string) {
  const sum = [...taskId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

/** Месячное представление календаря: 7×N с задачами-капсулами. */
export default function CalendarGrid({ month, tasks }: Props) {
  const navigate = useNavigate();
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const goToTask = (task: Task) => {
    if (task.projectId) navigate(`/tasks?boardId=${task.projectId}&taskId=${task.id}`);
    else navigate(`/tasks?taskId=${task.id}`);
  };

  return (
    <div className="bg-bg-panel rounded-2xl p-4 h-full flex flex-col">
      <div className="grid grid-cols-7 gap-2 mb-3 shrink-0">
        {WEEKDAYS_SHORT_RU.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold uppercase bg-white text-bg py-2 rounded-full"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 rounded-lg overflow-hidden flex-1 auto-rows-fr">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const dayTasks = tasks.filter(
            (tk) => tk.deadline && isSameDay(new Date(tk.deadline), day),
          );
          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-[88px] p-2 ${
                inMonth ? 'bg-bg-card' : 'bg-bg-card/40 text-white/30'
              }`}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              <div className="absolute left-2 right-2 bottom-2 flex flex-col gap-1">
                {dayTasks.slice(0, 2).map((tk) => (
                  <button
                    key={tk.id}
                    type="button"
                    onClick={() => goToTask(tk)}
                    className={`text-[11px] text-bg/90 truncate rounded-full px-2 py-0.5 hover:scale-105 transition ${colorFor(tk.id)}`}
                    title={tk.title}
                  >
                    {tk.title}
                  </button>
                ))}
                {dayTasks.length > 2 && (
                  <span className="text-[10px] text-white/60">+{dayTasks.length - 2} ещё</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
