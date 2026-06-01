import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectsStore } from '../store/useProjectsStore';
import { useTasksStore } from '../store/useTasksStore';
import { t } from '../i18n/ru';
import { UserIcon, LogoutIcon } from '../components/common/Icons';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const projects = useProjectsStore((s) => s.projects);
  const fetchProjects = useProjectsStore((s) => s.fetchAll);
  const tasks = useTasksStore((s) => s.tasks);
  const fetchTasks = useTasksStore((s) => s.fetchAll);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');

  useEffect(() => {
    fetchProjects().catch(() => undefined);
    fetchTasks().catch(() => undefined);
  }, [fetchProjects, fetchTasks]);

  const initials = (user?.name ?? user?.email ?? '?').slice(0, 1).toUpperCase();
  const assignedTasks = tasks.filter((tk) => tk.assigneeId === user?.id);
  const ownedProjects = projects.filter((p) => p.ownerId === user?.id);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <TopBar title={t.profile.title} />

      <div className="grid grid-cols-12 gap-6">
        {/* Карточка пользователя */}
        <section className="col-span-12 lg:col-span-5 panel flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full bg-accent flex items-center justify-center text-bg mb-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-4xl font-bold">{initials}</span>
            )}
          </div>

          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-line text-center text-xl"
              autoFocus
            />
          ) : (
            <h3 className="text-2xl font-bold text-white">{user?.name ?? '—'}</h3>
          )}
          <p className="text-sm text-white/50 mt-1">{user?.email}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setEditing((p) => !p)}
              className="btn-accent"
            >
              {editing ? t.common.save : t.profile.edit}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost flex items-center gap-2"
            >
              <LogoutIcon className="w-4 h-4" />
              {t.nav.logout}
            </button>
          </div>
        </section>

        {/* Статистика */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="panel">
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-3">
              {t.profile.boards}
            </h4>
            {ownedProjects.length === 0 ? (
              <p className="text-sm text-white/40">Пока нет собственных досок</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {ownedProjects.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/tasks?boardId=${p.id}`)}
                      className="w-full text-left bg-bg-card hover:bg-bg-panel
                                 rounded-xl px-4 py-3 text-sm text-white"
                    >
                      <span className="font-semibold">{p.name}</span>
                      {p.description && (
                        <span className="block text-xs text-white/50 truncate">
                          {p.description}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel">
            <h4 className="text-sm uppercase tracking-wider text-white/50 mb-3">
              Задачи на мне
            </h4>
            {assignedTasks.length === 0 ? (
              <p className="text-sm text-white/40">Активных задач нет</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {assignedTasks.slice(0, 6).map((tk) => (
                  <li key={tk.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          tk.projectId
                            ? `/tasks?boardId=${tk.projectId}&taskId=${tk.id}`
                            : `/tasks?taskId=${tk.id}`,
                        )
                      }
                      className="w-full text-left bg-bg-card hover:bg-bg-panel rounded-xl px-4 py-2 text-sm text-white"
                    >
                      {tk.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
