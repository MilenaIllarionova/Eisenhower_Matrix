import { ChevronLeft, ChevronRight } from './Icons';
import { formatMonthRu, t } from '../../i18n/ru';

interface Props {
  date: Date;
  onChange: (next: Date) => void;
  onToday: () => void;
  /** Отображать ли название месяца (по умолчанию true). */
  showMonth?: boolean;
  /** Отображать ли кнопку «Сегодня» (по умолчанию true). */
  showToday?: boolean;
}

export default function DatePager({
  date,
  onChange,
  onToday,
  showMonth = true,
  showToday = true,
}: Props) {
  const prev = () => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - 1);
    onChange(d);
  };
  const next = () => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    onChange(d);
  };

  return (
    <div className="flex items-center gap-3 text-white">
      {showMonth && (
        <span className="text-base font-medium capitalize">{formatMonthRu(date)}</span>
      )}
      {showToday && (
        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1 rounded-full bg-bg-card text-xs text-white/70 hover:text-white"
        >
          {t.common.today}
        </button>
      )}
      <button
        type="button"
        onClick={prev}
        aria-label="Назад"
        className="w-7 h-7 rounded-full bg-bg-card hover:bg-bg-panel flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Вперёд"
        className="w-7 h-7 rounded-full bg-bg-card hover:bg-bg-panel flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
