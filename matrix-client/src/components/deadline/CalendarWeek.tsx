import { useNavigate } from 'react-router-dom';
import { addDays, isSameDay, startOfWeek } from 'date-fns';
import { Task } from '../../types';
import { MONTHS_RU, WEEKDAYS_SHORT_RU } from '../../i18n/ru';

interface Props {
  date: Date;
  tasks: Task[];
}

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 09..18

/** Недельное представление: 7 дней × сетка часов, задачи — цветные блоки. */
export default function CalendarWeek({ date, tasks }: Props) {
  const navigate = useNavigate();
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const goToTask = (task: Task) =>
    task.projectId
      ? navigate(`/tasks?boardId=${task.projectId}&taskId=${task.id}`)
      : navigate(`/tasks?taskId=${task.id}`);

  return (
    <div className="bg-bg-panel rounded-2xl p-4 h-full flex flex-col overflow-hidden">
      {/* Заголовок дней */}
      <div className="grid mb-3 shrink-0" style={{ gridTemplateColumns: '64px repeat(7, minmax(120px, 1fr))' }}>
        <div />
        {days.map((d, idx) => (
          <div
            key={d.toISOString()}
            className="bg-white text-bg rounded-2xl mx-1 py-2 text-center text-xs font-semibold"
          >
            <div className="font-bold">{WEEKDAYS_SHORT_RU[idx]}</div>
            <div className="text-[10px] text-bg/60">
              {d.getDate()} {MONTHS_RU[d.getMonth()]}
            </div>
          </div>
        ))}
      </div>

      {/* Сетка часов */}
      <div className="grid bg-white/10 flex-1 overflow-y-auto scrollbar-thin" style={{ gridTemplateColumns: '64px repeat(7, minmax(120px, 1fr))' }}>
        {HOURS.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="bg-bg-card text-xs text-white/60 px-2 py-3 border-t border-white/5">
              {String(h).padStart(2, '0')}:00
            </div>
            {days.map((d) => (
              <div
                key={`${d.toISOString()}-${h}`}
                className="relative bg-bg-card border-t border-white/5 px-1 min-h-[56px]"
              >
                {tasks
                  .filter((tk) => {
                    if (!tk.deadline) return false;
                    const td = new Date(tk.deadline);
                    return isSameDay(td, d) && td.getHours() === h;
                  })
                  .map((tk) => (
                    <button
                      key={tk.id}
                      type="button"
                      onClick={() => goToTask(tk)}
                      className="block w-full text-left text-[11px] text-bg rounded-md px-2 py-1 my-1 bg-red-300/90 hover:bg-red-300 transition truncate"
                      title={tk.title}
                    >
                      {tk.title}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
