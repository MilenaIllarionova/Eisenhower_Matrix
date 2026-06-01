import { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Большая модалка по макету: тёмная карточка с заголовком и круглой кнопкой
 * закрытия в правом верхнем углу.
 */
export default function BigModal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-panel rounded-3xl w-full max-w-xl p-8 shadow-2xl
                   animate-[fadeIn_.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center
                       text-xl font-bold hover:bg-accent-dark transition"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
