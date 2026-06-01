import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserIcon } from '../common/Icons';
import SearchBar from '../common/SearchBar';

interface Props {
  /** Заголовок страницы. Если не задан или пустой — не отображаем (по правкам пользователя). */
  title?: string;
  showSearch?: boolean;
}

export default function TopBar({ title, showSearch = true }: Props) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const initials = (user?.name ?? user?.email ?? '?').slice(0, 1).toUpperCase();

  return (
    <header className="flex items-center justify-between mb-6 gap-4">
      <div className="min-w-0 flex-1">
        {title && <h2 className="text-5xl font-bold text-white truncate">{title}</h2>}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {showSearch && <SearchBar />}

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40
                     flex items-center justify-center text-accent hover:bg-accent/30 transition shrink-0"
          aria-label={user?.name ?? 'Профиль'}
          title={user?.email}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : user ? (
            <span className="font-bold text-base">{initials}</span>
          ) : (
            <UserIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
}
