import { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/layout/TopBar';
import BoardCard from '../components/boards/BoardCard';
import SidePanel from '../components/boards/SidePanel';
import TaskList from '../components/boards/TaskList';
import FriendsRow from '../components/boards/FriendsRow';
import TaskFormModal from '../components/boards/TaskFormModal';
import BoardFormModal from '../components/boards/BoardFormModal';
import AddFriendModal from '../components/boards/AddFriendModal';
import { useTasksStore } from '../store/useTasksStore';
import { useProjectsStore } from '../store/useProjectsStore';
import { useToastStore } from '../store/useToastStore';
import { t } from '../i18n/ru';

const sampleFriends = [
  { id: '1', name: 'Анна' },
  { id: '2', name: 'Михаил' },
  { id: '3', name: 'Ольга' },
  { id: '4', name: 'Дмитрий' },
];

export default function BoardsPage() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskBurning, setTaskBurning] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [friendModalOpen, setFriendModalOpen] = useState(false);

  const { tasks, fetchAll, createTask, updateTask } = useTasksStore();
  const { projects, fetchAll: fetchProjects, createProject } = useProjectsStore();
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    fetchAll().catch(() => undefined);
    fetchProjects().catch(() => undefined);
  }, [fetchAll, fetchProjects]);

  const burning = useMemo(
    () =>
      tasks
        .filter((tk) => tk.quadrant === 'urgent_important' && tk.status !== 'done')
        .slice(0, 6),
    [tasks],
  );
  const todo = useMemo(() => tasks.filter((tk) => tk.status === 'todo').slice(0, 6), [tasks]);

  const taskCountByBoard = (projectId: string) =>
    tasks.filter((tk) => tk.projectId === projectId).length;

  return (
    <>
      {/* Без приветствия — только поиск и аватар */}
      <TopBar />

      <div className="grid grid-cols-12 gap-6">
        {/*
          Высота секции фиксирована относительно вьюпорта; внутри карточки
          скроллятся вертикально. Скроллбар тонкий и появляется только
          когда контент не помещается.
        */}
        <section className="col-span-12 xl:col-span-8 panel flex flex-col h-[calc(100vh-9rem)]">
          {/* Заголовок «Мои доски» теперь СЛЕВА и единственный элемент шапки секции */}
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h3 className="text-3xl font-bold text-white">{t.boards.title}</h3>
            <button
              type="button"
              onClick={() => setBoardModalOpen(true)}
              aria-label={t.common.addBoard}
              className="w-9 h-9 rounded-full bg-accent text-bg flex items-center justify-center text-xl font-bold hover:bg-accent-dark transition"
            >
              +
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-white/40 py-6">{t.boards.boardsEmpty}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto scrollbar-thin pr-1 flex-1 content-start">
              {projects.map((p) => (
                <BoardCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                members={p.membersCount ?? 1}
                tasks={p.progress?.total ?? taskCountByBoard(p.id)}
                progress={p.progress}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="col-span-12 xl:col-span-4 flex flex-col gap-4 xl:h-[calc(100vh-9rem)] xl:overflow-y-auto scrollbar-thin pr-1">
          <SidePanel
            title={t.boards.burning}
            onAdd={() => {
              setTaskBurning(true);
              setTaskModalOpen(true);
            }}
          >
            <TaskList tasks={burning} variant="burning" emptyText="Нет срочных задач — отлично!" />
          </SidePanel>

          <SidePanel
            title={t.boards.todo}
            onAdd={() => {
              setTaskBurning(false);
              setTaskModalOpen(true);
            }}
          >
            <TaskList
              tasks={todo}
              variant="todo"
              emptyText="Список пуст — добавьте первую задачу"
              onToggle={(task) =>
                updateTask(task.id, {
                  status: task.status === 'done' ? 'todo' : 'done',
                })
              }
            />
          </SidePanel>

          <SidePanel title={t.boards.friends} onAdd={() => setFriendModalOpen(true)}>
            <FriendsRow people={sampleFriends} />
          </SidePanel>
        </aside>
      </div>

      <TaskFormModal
        open={taskModalOpen}
        burning={taskBurning}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={async (input) => {
          await createTask(input);
          pushToast({ title: 'Новая задача', body: `«${input.title}» добавлена` });
        }}
      />

      <BoardFormModal
        open={boardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onSubmit={async (input) => {
          const created = await createProject(input);
          pushToast({ title: 'Доска создана', body: `«${created.name}» готова к работе` });
        }}
      />

      <AddFriendModal open={friendModalOpen} onClose={() => setFriendModalOpen(false)} />
    </>
  );
}
