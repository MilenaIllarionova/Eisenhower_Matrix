import { useLayoutEffect, useRef, useState } from 'react';

export type ViewMode = 'month' | 'week' | 'day';

interface Props {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  labels?: Record<ViewMode, string>;
}

const defaultLabels: Record<ViewMode, string> = {
  month: 'Месяц',
  week: 'Неделя',
  day: 'День',
};

/**
 * Анимированный переключатель: белый индикатор плавно перемещается
 * между выбранными режимами.
 */
export default function ViewToggle({ value, onChange, labels = defaultLabels }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<ViewMode, HTMLButtonElement | null>>({
    month: null,
    week: null,
    day: null,
  });
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const item = itemRefs.current[value];
    const container = containerRef.current;
    if (!item || !container) return;
    const cRect = container.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    setIndicator({ left: r.left - cRect.left, width: r.width });
  }, [value]);

  const options: ViewMode[] = ['month', 'week', 'day'];

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center bg-bg-panel rounded-full p-1"
    >
      <div
        className="absolute top-1 bottom-1 bg-white rounded-full shadow transition-all duration-500 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
        aria-hidden
      />
      {options.map((opt) => (
        <button
          key={opt}
          ref={(el) => (itemRefs.current[opt] = el)}
          type="button"
          onClick={() => onChange(opt)}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300
            ${value === opt ? 'text-bg' : 'text-white/70 hover:text-white'}`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}
