import { useEffect, useState } from 'react';
import BigModal from '../common/BigModal';
import { SearchIcon } from '../common/Icons';
import { usersApi } from '../../services/users';
import { projectsApi } from '../../services/projects';
import { User, ProjectMember } from '../../types';
import { t } from '../../i18n/ru';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (userId: string) => Promise<void> | void;
  projectId?: string;
  currentAssigneeId?: string;
}

/** Модалка «Выберите исполнителя» с поиском и radio-выбором. */
export default function AssigneePickerModal({
  open,
  onClose,
  onPick,
  projectId,
  currentAssigneeId,
}: Props) {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [picked, setPicked] = useState<string | undefined>(currentAssigneeId);

  // Подгружаем участников доски
  useEffect(() => {
    if (!open || !projectId) return;
    projectsApi
      .members(projectId)
      .then((ms: ProjectMember[]) => {
        const users = ms
          .map((m) => (typeof m.userId === 'object' ? (m.userId as User) : null))
          .filter((u): u is User => !!u);
        setMembers(users);
      })
      .catch(() => setMembers([]));
  }, [open, projectId]);

  // Глобальный поиск пользователей при наличии запроса
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const h = setTimeout(() => {
      usersApi.search(query).then(setSearchResults).catch(() => setSearchResults([]));
    }, 250);
    return () => clearTimeout(h);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSearchResults([]);
      setPicked(currentAssigneeId);
    }
  }, [open, currentAssigneeId]);

  const list = query.trim() ? searchResults : members;

  const handleSave = async () => {
    if (!picked) return;
    await onPick(picked);
    onClose();
  };

  return (
    <BigModal open={open} onClose={onClose} title="Выберите исполнителя">
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.common.searchMember}
          className="input-pill pr-12"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center">
          <SearchIcon className="w-4 h-4" />
        </span>
      </div>

      <p className="text-sm font-semibold text-white mb-2">Результаты поиска</p>

      <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
        {list.length === 0 && (
          <li className="text-sm text-white/40 py-3">Никого не найдено</li>
        )}
        {list.map((u) => {
          const active = picked === u.id;
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => setPicked(u.id)}
                className={`w-full flex items-center justify-between gap-3 bg-bg-card rounded-2xl px-3 py-2 transition
                  ${active ? 'ring-2 ring-accent' : 'hover:bg-bg-panel'}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center text-white font-bold">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      u.name.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="text-left min-w-0">
                    <span className="block font-semibold text-white truncate">{u.name}</span>
                    <span className="block text-xs text-white/50 truncate">{u.email}</span>
                  </span>
                </span>
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition
                    ${active ? 'bg-accent border-accent text-bg' : 'border-white/30'}`}
                >
                  {active && <span className="text-bg font-bold leading-none">✓</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center gap-3 pt-6">
        <button type="button" onClick={onClose} className="btn-ghost">
          {t.common.cancelUpper}
        </button>
        <button type="button" onClick={handleSave} className="btn-accent-lg" disabled={!picked}>
          {t.common.saveUpper}
        </button>
      </div>
    </BigModal>
  );
}
