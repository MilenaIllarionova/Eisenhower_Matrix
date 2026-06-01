import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../i18n/ru';

interface Props {
  children: ReactNode;
}

const tabs = [
  { to: '/login', label: t.auth.loginUpper },
  { to: '/signup', label: t.auth.signupUpper },
];

const BLEED = 28;
const RADIUS = 28;

export default function AuthLayout({ children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeIdx = pathname.startsWith('/signup') ? 1 : 0;

  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, width: 0, visible: false });

  const recalc = () => {
    const el = tabRefs.current[activeIdx];
    const panel = panelRef.current;
    if (!el || !panel) return;
    const pRect = panel.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({
      top: r.top - pRect.top,
      height: r.height,
      width: r.width + BLEED,
      visible: true,
    });
  };

  useLayoutEffect(recalc, [activeIdx, pathname]);

  useEffect(() => {
    const handler = () => recalc();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const maskTop = `radial-gradient(circle ${RADIUS}px at bottom right, transparent ${RADIUS - 0.5}px, #000 ${RADIUS}px)`;
  const maskBottom = `radial-gradient(circle ${RADIUS}px at top right, transparent ${RADIUS - 0.5}px, #000 ${RADIUS}px)`;

  return (
    <div className="h-screen w-screen flex bg-bg overflow-hidden">
      <div ref={panelRef} className="relative w-[520px] shrink-0 bg-brand-gradient flex flex-col">
        <div className="pt-10 pb-6 shrink-0 flex justify-center">
          <h1 className="font-brand text-bg text-6xl">{t.app.title}</h1>
        </div>

        <div
          className="absolute pointer-events-none"
          style={{
            top: indicator.top,
            height: indicator.height,
            right: -BLEED,
            width: indicator.width,
            opacity: indicator.visible ? 1 : 0,
            transition: 'top 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
          }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-bg rounded-l-3xl" />
          <div className="absolute bg-brand-gradient" style={{ top: -RADIUS, right: BLEED, width: RADIUS, height: RADIUS, WebkitMaskImage: maskTop, maskImage: maskTop }} />
          <div className="absolute bg-brand-gradient" style={{ bottom: -RADIUS, right: BLEED, width: RADIUS, height: RADIUS, WebkitMaskImage: maskBottom, maskImage: maskBottom }} />
        </div>

        <div className="relative flex-1 flex flex-col items-end justify-center gap-12 mb-40 pr-0">
          {tabs.map((tab, idx) => (
            <button
              key={tab.to}
              ref={(el) => (tabRefs.current[idx] = el)}
              type="button"
              onClick={() => navigate(tab.to)}
              className={`relative z-10 px-10 py-4 font-extrabold text-3xl tracking-wide transition-colors duration-300 ${
                activeIdx === idx ? 'text-white' : 'text-bg/70 hover:text-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-bg flex flex-col overflow-y-auto scrollbar-thin">
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    </div>
  );
}