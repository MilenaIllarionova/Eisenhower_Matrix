import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './Icons';
import { useProjectsStore } from '../../store/useProjectsStore';
import { useTasksStore } from '../../store/useTasksStore';
import { usersApi } from '../../services/users';
import { Task, User, Project } from '../../types';
import { t } from '../../i18n/ru';

interface Results {
  boards: Project[];
  tasks: Task[];
  users: { user: User; tasks: Task[] }[];
}

/**
 * Длинный поиск в шапке — полностью вмещает плейсхолдер
 * «Введите название доски или задачи» и стрелочную ширину под результаты.
 */
export default function SearchBar() {
  const navigate = useNavigate();
  const projects = useProjectsStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setRemoteUsers([]);
      return;
    }
    const handle = setTimeout(() => {
      usersApi.search(query).then(setRemoteUsers).catch(() => setRemoteUsers([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const results = useMemo<Results>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { boards: [], tasks: [], users: [] };
    const boards = projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
    const localTasks = tasks.filter((tk) => tk.title.toLowerCase().includes(q)).slice(0, 8);
    const users = remoteUsers.slice(0, 5).map((u) => ({
      user: u,
      tasks: tasks.filter((tk) => tk.assigneeId === u.id),
    }));
    return { boards, tasks: localTasks, users };
  }, [query, projects, tasks, remoteUsers]);

  const empty =
    query.trim() &&
    results.boards.length === 0 &&
    results.tasks.length === 0 &&
    results.users.length === 0;

  const goToTask = (task: Task) => {
    setOpen(false);
    setQuery('');
    if (task.projectId) navigate(`/tasks?boardId=${task.projectId}&taskId=${task.id}`);
    else navigate(`/tasks?taskId=${task.id}`);
  };

  const goToBoard = (board: Project) => {
    setOpen(false);
    setQuery('');
    navigate(`/tasks?boardId=${board.id}`);
  };

  return (
    <div ref={containerRef} className="relative w-[28rem] max-w-full">
      <div className="flex items-center gap-2 bg-bg-panel rounded-full px-5 py-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder={t.common.search}
          className="bg-transparent outline-none text-sm w-full text-white placeholder-white/40"
        />
        <button
          type="button"
          aria-label="Поиск"
          className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-bg shrink-0"
        >
          <SearchIcon className="w-4 h-4" />
        </button>
      </div>

      {open && query.trim() && (
        <div
          className="absolute right-0 top-full mt-2 w-[28rem] bg-bg-panel border border-white/10
                     rounded-2xl shadow-2xl z-50 max-h-[28rem] overflow-y-auto scrollbar-thin"
        >
          {empty && <div className="p-5 text-sm text-white/50">{t.search.nothing}</div>}

          {results.boards.length > 0 && (
            <Section title={t.search.boards}>
              {results.boards.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => goToBoard(b)}
                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-bg-card text-sm text-white"
                >
                  <span className="font-semibold">{b.name}</span>
                  {b.description && (
                    <span className="block text-xs text-white/50 truncate">{b.description}</span>
                  )}
                </button>
              ))}
            </Section>
          )}

          {results.tasks.length > 0 && (
            <Section title={t.search.tasks}>
              {results.tasks.map((tk) => (
                <button
                  key={tk.id}
                  type="button"
                  onClick={() => goToTask(tk)}
                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-bg-card text-sm text-white"
                >
                  {tk.title}
                </button>
              ))}
            </Section>
          )}

          {results.users.length > 0 && (
            <Section title={t.search.members}>
              {results.users.map(({ user, tasks: userTasks }) => (
                <div key={user.id} className="px-4 py-2">
                  <div className="text-sm text-white font-semibold">
                    {user.name}{' '}
                    <span className="text-white/40 text-xs">({user.email})</span>
                  </div>
                  {userTasks.length > 0 ? (
                    <ul className="mt-1 ml-2 space-y-1">
                      {userTasks.slice(0, 3).map((tk) => (
                        <li key={tk.id}>
                          <button
                            type="button"
                            onClick={() => goToTask(tk)}
                            className="text-xs text-white/70 hover:text-accent"
                          >
                            · {tk.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ml-2 text-xs text-white/40">
                      {t.search.membersTasks}: —
                    </p>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-2">
      <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-white/40">{title}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}
