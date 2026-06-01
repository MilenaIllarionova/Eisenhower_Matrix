import { useToastStore } from '../../store/useToastStore';

/**
 * Контейнер всплывающих уведомлений в левом нижнем углу — соответствует макету.
 * Тосты автоматически исчезают через 5 секунд.
 */
export default function ToastHost() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed left-4 bottom-4 z-[60] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => remove(t.id)}
          className="text-left bg-brand-gradient text-bg rounded-2xl px-4 py-3 shadow-2xl
                     border border-white/20 animate-[fadeIn_.2s_ease-out]
                     hover:scale-[1.02] transition"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5" aria-hidden>🔔</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm truncate">{t.title}</h4>
                <span className="text-[10px] opacity-60">сейчас</span>
              </div>
              {t.body && (
                <p className="text-xs mt-1 opacity-80 leading-snug">{t.body}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
