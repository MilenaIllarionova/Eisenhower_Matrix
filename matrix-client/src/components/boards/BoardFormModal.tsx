import { FormEvent, useEffect, useState } from 'react';
import BigModal from '../common/BigModal';
import { SearchIcon } from '../common/Icons';
import { usersApi } from '../../services/users';
import { PROJECT_ROLE_LABEL, ProjectRole, User } from '../../types';
import { t } from '../../i18n/ru';

interface Invite {
  user: User;
  role: ProjectRole;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    description?: string;
    memberInvites: { userId: string; role: ProjectRole }[];
  }) => Promise<void>;
}

export default function BoardFormModal({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setMemberQuery('');
      setMemberResults([]);
      setInvites([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!memberQuery.trim()) {
      setMemberResults([]);
      return;
    }
    const handle = setTimeout(() => {
      usersApi.search(memberQuery).then(setMemberResults).catch(() => setMemberResults([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [memberQuery]);

  const addInvite = (user: User) => {
    if (invites.some((i) => i.user.id === user.id)) return;
    setInvites((prev) => [...prev, { user, role: 'member' }]);
    setMemberQuery('');
    setMemberResults([]);
  };

  const removeInvite = (userId: string) =>
    setInvites((prev) => prev.filter((i) => i.user.id !== userId));

  const changeRole = (userId: string, role: ProjectRole) =>
    setInvites((prev) => prev.map((i) => (i.user.id === userId ? { ...i, role } : i)));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        memberInvites: invites.map((i) => ({ userId: i.user.id, role: i.role })),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BigModal open={open} onClose={onClose} title={t.common.addBoard}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Название доски */}
        <div>
          <label className="block mb-2 font-semibold text-white">{t.boards.boardName}</label>
          <input
            type="text"
            required
            maxLength={120}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.boards.boardNamePh}
            className="input-pill"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block mb-2 font-semibold text-white">
            {t.boards.boardDescription}{' '}
            <span className="text-white/40 font-normal">({t.common.optional})</span>
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.boards.boardDescPh}
            className="textarea-box"
          />
          <div className="text-right text-xs text-white/40 mt-1">
            {description.length}/500
          </div>
        </div>

        {/* Поиск участников */}
        <div className="relative">
          <label className="block mb-2 font-semibold text-white">
            {t.boards.addMembers}{' '}
            <span className="text-white/40 font-normal">({t.common.optional})</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder={t.common.searchMember}
              className="input-pill pr-12"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center">
              <SearchIcon className="w-4 h-4" />
            </span>
          </div>
          {memberResults.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-bg-card rounded-xl border border-white/10 shadow-lg max-h-48 overflow-y-auto scrollbar-thin">
              {memberResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => addInvite(u)}
                  className="w-full text-left px-4 py-2 hover:bg-bg-panel text-sm text-white"
                >
                  <span className="font-medium">{u.name}</span>{' '}
                  <span className="text-white/40 text-xs">({u.email})</span>
                </button>
              ))}
            </div>
          )}
          {invites.length === 0 ? (
            <p className="text-xs text-white/40 mt-2">{t.boards.canAddLater}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {invites.map((i) => (
                <li
                  key={i.user.id}
                  className="flex items-center justify-between gap-3 bg-bg-card rounded-xl px-3 py-2"
                >
                  <span className="text-sm text-white truncate flex-1">
                    {i.user.name}{' '}
                    <span className="text-white/40 text-xs">({i.user.email})</span>
                  </span>
                  <select
                    value={i.role}
                    onChange={(e) => changeRole(i.user.id, e.target.value as ProjectRole)}
                    className="bg-bg-panel text-white text-xs rounded-full px-3 py-1 outline-none cursor-pointer"
                  >
                    {(['admin', 'member', 'viewer'] as ProjectRole[]).map((r) => (
                      <option key={r} value={r}>
                        {PROJECT_ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeInvite(i.user.id)}
                    className="w-7 h-7 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                    aria-label="Удалить"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex justify-center gap-3 pt-4">
          <button type="submit" className="btn-accent-lg" disabled={submitting || !name.trim()}>
            {submitting ? '...' : t.common.saveUpper}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost">
            {t.common.cancelUpper}
          </button>
        </div>
      </form>
    </BigModal>
  );
}
