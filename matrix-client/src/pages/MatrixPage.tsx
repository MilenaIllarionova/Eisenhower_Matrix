import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { isSameDay, startOfDay } from 'date-fns';
import { useTasksStore } from '../store/useTasksStore';
import { useProjectsStore } from '../store/useProjectsStore';
import { useToastStore } from '../store/useToastStore';
import { projectsApi } from '../services/projects';
import { Quadrant, QUADRANTS, Task, TaskStatus, User } from '../types';
import FilterPanel from '../components/matrix/FilterPanel';
import QuadrantColumn from '../components/matrix/Quadrant';
import WeekStrip from '../components/matrix/WeekStrip';
import TaskFormModal from '../components/boards/TaskFormModal';
import TaskDetailModal from '../components/matrix/TaskDetailModal';
import AddFriendModal from '../components/boards/AddFriendModal';
import FriendsRow from '../components/boards/FriendsRow';
import TrashPanel from '../components/matrix/TrashPanel';
import { formatMonthRu, t } from '../i18n/ru';

export default function MatrixPage() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId') ?? undefined;
  const taskIdFromUrl = searchParams.get('taskId') ?? undefined;

  const [date, setDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuadrant, setModalQuadrant] = useState<Quadrant | undefined>(undefined);
  const [filter, setFilter] = useState<Set<TaskStatus>>(new Set<TaskStatus>());
  const [openedTask, setOpenedTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { matrix, tasks, fetchAll, createTask, moveTask } = useTasksStore();
  const projects = useProjectsStore((s) => s.projects);
  const fetchProjects = useProjectsStore((s) => s.fetchAll);
  const pushToast = useToastStore((s) => s.push);

  const currentBoard = projects.find((p) => p.id === boardId);

  useEffect(() => {
    fetchAll(undefined, boardId).catch(() => undefined);
    fetchProjects().catch(() => undefined);
  }, [fetchAll, fetchProjects]);

  useEffect(() => {
    if (!boardId) {
      setMembers([]);
      return;
    }
    projectsApi
      .members(boardId)
      .then((ms) => {
        const users = ms
          .map((m) => (typeof m.userId === 'object' ? (m.userId as User) : null))
          .filter((u): u is User => !!u);
        setMembers(users);
      })
      .catch(() => setMembers([]));
  }, [boardId]);

  useEffect(() => {
    if (!taskIdFromUrl) return;
    const found = tasks.find((tk) => tk.id === taskIdFromUrl);
    if (found) setOpenedTask(found);
  }, [taskIdFromUrl, tasks]);

  /**
   * Фильтрация задач для матрицы:
   * - всегда исключаем выполненные и удалённые (они уже в корзине);
   * - задача показывается если её дедлайн == выбранный день, либо если у неё
   *   нет дедлайна вообще (backlog), либо если она просрочена и ещё не сделана
   *   (просрочка отображается с предупреждением, чтобы пользователь сдвинул срок).
   */
  const filteredMatrix = useMemo(() => {
    const result: Record<Quadrant, Task[]> = {
      urgent_important: [],
      important_not_urgent: [],
      urgent_not_important: [],
      not_urgent_not_important: [],
    };
    const dayStart = startOfDay(date).getTime();
    const todayStart = startOfDay(new Date()).getTime();

    for (const q of QUADRANTS) {
      let list = matrix[q];
      if (boardId) list = list.filter((tk) => tk.projectId === boardId);
      if (filter.size > 0) list = list.filter((tk) => filter.has(tk.status));

      list = list.filter((tk) => {
        if (tk.status === 'done') return false;
        if (!tk.deadline) return true; // backlog — показываем всегда
        const tk_day = startOfDay(new Date(tk.deadline)).getTime();
        // Текущий выбранный день
        if (tk_day === dayStart) return true;
        // Просроченные задачи показываем только в текущем дне
        if (tk_day < todayStart && dayStart === todayStart) return true;
        return false;
      });
      result[q] = list;
    }
    return result;
  }, [matrix, filter, boardId, date]);

  const overdueCount = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    return tasks.filter((tk) => {
      if (!tk.deadline || tk.status === 'done') return false;
      if (boardId && tk.projectId !== boardId) return false;
      return startOfDay(new Date(tk.deadline)).getTime() < todayStart;
    }).length;
  }, [tasks, boardId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = event.active.id as string;
    const droppedOn = event.over?.id as string | undefined;
    if (!droppedOn?.startsWith('q:')) return;
    const target = droppedOn.slice(2) as Quadrant;
    moveTask(taskId, target);
  };

  const toggleFilter = (status: TaskStatus) => {
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const isToday = isSameDay(date, new Date());

  return (
    <div className="flex gap-6">
      <aside className="w-72 shrink-0 flex flex-col gap-4">
        <FilterPanel selected={filter} onToggle={toggleFilter} />
        <TrashPanel boardId={boardId} />

        <div className="panel">
          <h3 className="text-lg font-semibold text-white mb-4">{t.matrix.members}</h3>
          <FriendsRow
            people={
              members.length
                ? members
                : [
                    { id: 'a', name: 'Анна' },
                    { id: 'b', name: 'Михаил' },
                    { id: 'c', name: 'Ольга' },
                    { id: 'd', name: 'Дмитрий' },
                  ]
            }
          />
        </div>
      </aside>

      {/*
        Блок матрицы: вертикальные отступы 20px (my-5).
        Внутри: шапка → 45px → полоса дней → 20px → сетка матрицы.
        ViewToggle (Месяц/Неделя/День) убран — задачи всегда фильтруются по выбранному дню.
      */}
      <section className="flex-1 bg-brand-gradient rounded-3xl px-6 py-6 my-5">
        {/* Шапка: месяц + название доски слева, кнопка приглашения справа */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-bg/10 text-bg text-base font-semibold capitalize">
              {formatMonthRu(date)}
            </span>
            {currentBoard && (
              <span className="px-3 py-1 rounded-full bg-bg/10 text-bg text-sm">
                {currentBoard.name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-bg/15 text-bg
                       hover:bg-bg/25 px-5 py-2 font-semibold text-sm transition"
          >
            + Пригласить участника
          </button>
        </div>

        {/* 45px между шапкой и полосой дней */}
        <div style={{ marginTop: 45 }}>
          <WeekStrip date={date} onSelect={setDate} />
        </div>

        {overdueCount > 0 && isToday && (
          <div className="mt-4 rounded-2xl bg-red-500/20 text-red-100 text-sm px-4 py-2 border border-red-500/30">
            <span className="font-semibold">Просроченные задачи ({overdueCount}):</span> откройте
            задачу и сдвиньте срок дедлайна или нажмите «Выполнено».
          </div>
        )}

        {/* 20px между полосой дней и матрицей */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginTop: 20 }}>
            {QUADRANTS.map((q) => (
              <QuadrantColumn
                key={q}
                quadrant={q}
                tasks={filteredMatrix[q]}
                onAdd={(quadrant) => {
                  setModalQuadrant(quadrant);
                  setModalOpen(true);
                }}
                onCardOpen={(task) => setOpenedTask(task)}
              />
            ))}
          </div>
        </DndContext>
      </section>

      <TaskFormModal
        open={modalOpen}
        defaultQuadrant={modalQuadrant}
        defaultProjectId={boardId}
        onClose={() => setModalOpen(false)}
        onSubmit={async (input) => {
          await createTask({ ...input, projectId: input.projectId ?? boardId });
          pushToast({ title: 'Новая задача', body: `«${input.title}» добавлена` });
        }}
      />

      <TaskDetailModal
        open={!!openedTask}
        task={openedTask}
        onClose={() => setOpenedTask(null)}
      />

      <AddFriendModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
