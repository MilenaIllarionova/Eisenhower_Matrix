import { useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectsStore } from '../store/useProjectsStore';
import { useToastStore } from '../store/useToastStore';

/**
 * Настройки: профиль + управление досками (удаление).
 * Удаление доступно только владельцу/администратору доски (проверяет бэк).
 */
export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { projects, fetchAll, deleteProject } = useProjectsStore();
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    fetchAll().catch(() => undefined);
  }, [fetchAll]);

  const ownProjects = projects.filter((p) => p.ownerId === user?.id);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить доску «${name}»? Все её задачи будут безвозвратно удалены.`))
      return;
    try {
      await deleteProject(id);
      pushToast({ title: 'Доска удалена', body: `«${name}» и её задачи удалены` });
    } catch (err: any) {
      pushToast({
        title: 'Ошибка',
        body: err?.response?.data?.message ?? 'Не удалось удалить доску',
      });
    }
  };

  return (
    <>
      <TopBar />

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-5 panel">
          <h3 className="text-lg font-semibold text-white mb-4">Профиль</h3>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <dt className="text-white/50">Имя</dt>
            <dd className="col-span-2 text-white">{user?.name ?? '—'}</dd>
            <dt className="text-white/50">Email</dt>
            <dd className="col-span-2 text-white">{user?.email ?? '—'}</dd>
          </dl>
        </section>

        <section className="col-span-12 lg:col-span-7 panel">
          <h3 className="text-lg font-semibold text-white mb-4">Управление досками</h3>
          {ownProjects.length === 0 ? (
            <p className="text-sm text-white/40">У вас нет собственных досок</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
              {ownProjects.map((p) => (
                <li
                  key={p.id}
                  className="bg-bg-card rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-white/50 truncate">{p.description}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.name)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 text-red-200
                               hover:bg-red-500/30 px-4 py-2 font-semibold text-xs transition shrink-0"
                  >
                    <span aria-hidden>🗑</span>
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-white/40">
            Удаление доски безвозвратно: все её задачи и связи с участниками будут удалены.
          </p>
        </section>
      </div>
    </>
  );
}
