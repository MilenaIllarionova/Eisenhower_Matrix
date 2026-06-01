import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ClipboardIcon, FireIcon, LogoutIcon, PencilIcon, SettingsIcon } from '../common/Icons';
import { t } from '../../i18n/ru';

const navItems = [
  { to: '/boards', label: t.nav.boards, Icon: ClipboardIcon },
  { to: '/deadline', label: t.nav.deadline, Icon: FireIcon },
  { to: '/tasks', label: t.nav.tasks, Icon: PencilIcon },
  { to: '/settings', label: t.nav.settings, Icon: SettingsIcon },
];

const BLEED = 28;
const RADIUS = 28;

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const asideRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });

  const activeIdx = navItems.findIndex((it) =>
    location.pathname === '/' ? it.to === '/boards' : location.pathname.startsWith(it.to),
  );

  const recalc = () => {
    if (activeIdx < 0) {
      setIndicator((p) => ({ ...p, visible: false }));
      return;
    }
    const el = itemRefs.current[activeIdx];
    const aside = asideRef.current;
    if (!el || !aside) return;
    const asideRect = aside.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({ top: r.top - asideRect.top, height: r.height, visible: true });
  };

  useLayoutEffect(recalc, [activeIdx, location.pathname]);

  useEffect(() => {
    const handler = () => recalc();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const maskTop = `radial-gradient(circle ${RADIUS}px at bottom right, transparent ${RADIUS - 0.5}px, #000 ${RADIUS}px)`;
  const maskBottom = `radial-gradient(circle ${RADIUS}px at top right, transparent ${RADIUS - 0.5}px, #000 ${RADIUS}px)`;

  return (
    <aside ref={asideRef} className="relative w-64 shrink-0 bg-brand-gradient flex flex-col rounded-r-3xl h-full">
      <div className="px-8 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-4xl font-brand text-bg leading-none">Matrix</h1>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden text-bg/70 hover:text-bg transition"
          aria-label="Закрыть меню"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        className="absolute pointer-events-none transition-all duration-500 ease-out"
        style={{
          top: indicator.top,
          height: indicator.height,
          left: 16,
          right: -BLEED,
          opacity: indicator.visible ? 1 : 0,
        }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-bg rounded-full" />
        <div
          className="absolute bg-brand-gradient"
          style={{
            top: -RADIUS,
            right: BLEED,
            width: RADIUS,
            height: RADIUS,
            WebkitMaskImage: maskTop,
            maskImage: maskTop,
          }}
        />
        <div
          className="absolute bg-brand-gradient"
          style={{
            bottom: -RADIUS,
            right: BLEED,
            width: RADIUS,
            height: RADIUS,
            WebkitMaskImage: maskBottom,
            maskImage: maskBottom,
          }}
        />
      </div>

      <nav className="relative flex-1 mt-8 px-3">
        <div className="relative space-y-3">
          {navItems.map(({ to, label, Icon }, idx) => (
            <NavLink
              key={to}
              to={to}
              ref={(el) => (itemRefs.current[idx] = el)}
              onClick={onClose}
              className={({ isActive }) =>
                `relative z-10 flex items-center gap-4 px-5 py-3 rounded-r-full font-bold text-lg tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : 'text-bg hover:bg-white/10'}`
              }
            >
              <Icon className="w-7 h-7" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="m-6 flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent/80 text-bg font-semibold hover:bg-accent transition"
      >
        <LogoutIcon className="w-6 h-6" />
        {t.nav.logout}
      </button>
    </aside>
  );
}