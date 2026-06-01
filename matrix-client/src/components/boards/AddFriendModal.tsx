import { useEffect, useState } from 'react';
import BigModal from '../common/BigModal';
import { SearchIcon } from '../common/Icons';
import { usersApi } from '../../services/users';
import { useToastStore } from '../../store/useToastStore';
import { User } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onInvite?: (user: User) => void;
}

/**
 * Модалка «Добавить в друзья» по дизайну:
 * поиск участников + список с круглыми кнопками «добавить» + поле «Пригласить по email».
 */
export default function AddFriendModal({ open, onClose, onInvite }: Props) {
  const pushToast = useToastStore((s) => s.push);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setEmail('');
      setAdded(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const h = setTimeout(() => {
      usersApi.search(query).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(h);
  }, [query]);

  const handleAdd = (user: User) => {
    setAdded((prev) => new Set(prev).add(user.id));
    onInvite?.(user);
    pushToast({
      title: 'Новый друг',
      body: `${user.name} добавлен(а) в ваш список`,
    });
  };

  const handleEmailInvite = () => {
    if (!email.trim()) return;
    pushToast({
      title: 'Приглашение отправлено',
      body: `Письмо на ${email} с приглашением присоединиться к пространству Matrix.`,
    });
    setEmail('');
  };

  return (
    <BigModal open={open} onClose={onClose} title="Добавить в друзья">
      <div className="flex flex-col gap-5">
        {/* Поиск */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск участников по имени или email"
            className="input-pill pr-12"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center">
            <SearchIcon className="w-4 h-4" />
          </span>
        </div>

        {/* Результаты */}
        <div>
          <p className="text-sm font-semibold text-white mb-2">Результаты поиска</p>
          {results.length === 0 ? (
            <p className="text-xs text-white/40">
              {query.trim() ? 'Никого не найдено' : 'Начните вводить имя или email'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
              {results.map((u) => {
                const isAdded = added.has(u.id);
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 bg-bg-card rounded-2xl px-3 py-2"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center text-white font-bold">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          u.name.slice(0, 1).toUpperCase()
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-white truncate">{u.name}</span>
                        <span className="block text-xs text-white/50 truncate">{u.email}</span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdd(u)}
                      disabled={isAdded}
                      aria-label="Добавить в друзья"
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition
                        ${isAdded
                          ? 'bg-emerald-400/60 text-bg cursor-default'
                          : 'bg-accent text-bg hover:bg-accent-dark'}`}
                    >
                      {isAdded ? '✓' : '👤+'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Приглашение по email */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-sm font-semibold text-white mb-2">Пригласить по email</p>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              className="input-pill pr-12"
              onKeyDown={(e) => e.key === 'Enter' && handleEmailInvite()}
            />
            <button
              type="button"
              onClick={handleEmailInvite}
              aria-label="Отправить приглашение"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center hover:bg-accent-dark transition"
            >
              ✈
            </button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            Пользователь получит приглашение присоединиться к вашему пространству.
          </p>
        </div>
      </div>
    </BigModal>
  );
}
