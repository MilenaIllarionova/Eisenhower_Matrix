import { addDays, isSameDay, startOfWeek } from 'date-fns';
import { WEEKDAYS_SHORT_RU } from '../../i18n/ru';
import { ChevronLeft, ChevronRight } from '../common/Icons';

interface Props {
  /** Текущая выбранная дата. */
  date: Date;
  onSelect: (d: Date) => void;
  /** Сколько дней показывать (по умолчанию 7). */
  days?: number;
}

/**
 * Полоса дней со стрелочками влево/вправо для пролистывания недели.
 * GMT-плашка убрана по правкам пользователя.
 */
export default function WeekStrip({ date, onSelect, days = 7 }: Props) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const items = Array.from({ length: days }, (_, i) => addDays(start, i));

  const shiftWeek = (delta: number) => {
    const nd = new Date(date);
    nd.setDate(nd.getDate() + delta * 7);
    onSelect(nd);
  };

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        aria-label="Предыдущая неделя"
        className="w-10 rounded-2xl bg-bg/15 hover:bg-bg/25 text-bg flex items-center justify-center transition shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-thin">
        {items.map((d, idx) => {
          const active = isSameDay(d, date);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect(d)}
              className={`min-w-[88px] flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition
                ${active ? 'bg-white text-bg' : 'bg-emerald-700/30 text-white/80 hover:bg-emerald-700/50'}`}
            >
              <span className="text-sm font-medium lowercase">
                {WEEKDAYS_SHORT_RU[idx % 7].toLowerCase()}
              </span>
              <span className="text-2xl font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => shiftWeek(1)}
        aria-label="Следующая неделя"
        className="w-10 rounded-2xl bg-bg/15 hover:bg-bg/25 text-bg flex items-center justify-center transition shrink-0"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
