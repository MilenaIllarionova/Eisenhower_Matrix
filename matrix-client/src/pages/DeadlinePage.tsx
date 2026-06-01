import { useEffect, useState } from 'react';
import TopBar from '../components/layout/TopBar';
import ViewToggle, { ViewMode } from '../components/common/ViewToggle';
import DatePager from '../components/common/DatePager';
import CalendarGrid from '../components/deadline/CalendarGrid';
import CalendarWeek from '../components/deadline/CalendarWeek';
import CalendarDay from '../components/deadline/CalendarDay';
import { useTasksStore } from '../store/useTasksStore';
import { formatDateLongRu, formatMonthRu, t } from '../i18n/ru';

export default function DeadlinePage() {
  const [mode, setMode] = useState<ViewMode>('month');
  const [date, setDate] = useState<Date>(new Date());
  const { tasks, fetchAll } = useTasksStore();

  useEffect(() => {
    fetchAll().catch(() => undefined);
  }, [fetchAll]);

  // На дневном представлении показываем полную дату с днём недели,
  // на остальных — название месяца. Эта подпись слева — единственное место
  // отображения даты (правый дубль «Май 2026» убран по правкам).
  const headerLabel = mode === 'day' ? formatDateLongRu(date) : formatMonthRu(date);

  return (
    <>
      <TopBar />

      <div className="flex items-center justify-between mb-5">
        <ViewToggle
          value={mode}
          onChange={setMode}
          labels={{ month: t.deadline.month, week: t.deadline.week, day: t.deadline.day }}
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base text-white/80 capitalize">{headerLabel}</h3>
        {/* DatePager только со стрелочками — без дубля месяца и без «Сегодня» */}
        <DatePager
          date={date}
          onChange={setDate}
          onToday={() => setDate(new Date())}
          showMonth={false}
          showToday={false}
        />
      </div>

      {/*
        Контейнер фиксированной высоты — все три представления (Месяц/Неделя/День)
        умещаются одинаково и не «прыгают» по высоте.
      */}
      <div className="h-[calc(100vh-16rem)] min-h-[32rem]">
        {mode === 'month' && <CalendarGrid month={date} tasks={tasks} />}
        {mode === 'week' && <CalendarWeek date={date} tasks={tasks} />}
        {mode === 'day' && <CalendarDay date={date} tasks={tasks} />}
      </div>
    </>
  );
}
