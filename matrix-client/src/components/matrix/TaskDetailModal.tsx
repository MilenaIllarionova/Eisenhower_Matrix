import { useEffect, useState } from 'react';
import BigModal from '../common/BigModal';
import AssigneePickerModal from './AssigneePickerModal';
import { Task, TaskStatus, STATUS_LABEL, User } from '../../types';
import { useTasksStore } from '../../store/useTasksStore';
import { useToastStore } from '../../store/useToastStore';
import { usersApi } from '../../services/users';
import { t } from '../../i18n/ru';

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: 'bg-sky-400',
  in_progress: 'bg-amber-400',
  on_hold: 'bg-zinc-400',
  review: 'bg-violet-400',
  done: 'bg-emerald-400',
};

const STATUS_BG: Record<TaskStatus, string> = {
  todo: 'bg-sky-400/20 text-sky-200',
  in_progress: 'bg-amber-400/20 text-amber-200',
  on_hold: 'bg-zinc-400/20 text-zinc-200',
  review: 'bg-violet-400/20 text-violet-200',
  done: 'bg-emerald-400/20 text-emerald-200',
};

function fmtDate(iso?: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  const months = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  return {
    date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
}

/**
 * Раскрытие задачи: название, описание, исполнитель (делегирование),
 * срок (дата+время), статус. Кнопки: Удалить / Отмена / Сохранить / Выполнено.
 */
export default function TaskDetailModal({ open, onClose, task }: Props) {
  const { updateTask, removeTask } = useTasksStore();
  const pushToast = useToastStore((s) => s.push);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignee, setAssignee] = useState<User | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDeadline(task.deadline);
    setAssigneeId(task.assigneeId);
    setStatus(task.status);
  }, [task]);

  useEffect(() => {
    if (!assigneeId) {
      setAssignee(null);
      return;
    }
    usersApi.search(assigneeId).then((users) => {
      const found = users.find((u) => u.id === assigneeId);
      setAssignee(found ?? null);
    });
  }, [assigneeId]);

  if (!task) return null;

  const dirty =
    title !== task.title ||
    (description || '') !== (task.description || '') ||
    deadline !== task.deadline ||
    assigneeId !== task.assigneeId ||
    status !== task.status;

  const handleSave = async () => {
    await updateTask(task.id, {
      title,
      description,
      deadline: deadline ?? undefined,
      assigneeId: assigneeId ?? undefined,
      status,
    });
    pushToast({ title: 'Изменения сохранены', body: `Задача «${title}» обновлена` });
    onClose();
  };

  const handleDone = async () => {
    await updateTask(task.id, { status: 'review' });
    pushToast({
      title: 'Завершение задачи',
      body:
        'Задача отправлена на проверку. Владелец доски получит уведомление о завершении задачи и проверит её.',
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm(`Переместить «${title}» в корзину?`)) return;
    await removeTask(task.id);
    pushToast({
      title: 'В корзине',
      body: `«${title}» удалена. Восстановить можно из блока «Корзина».`,
    });
    onClose();
  };

  const handleAssigneeChange = async (newId: string) => {
    if (newId === assigneeId) return;
    setAssigneeId(newId);
    await updateTask(task.id, { assigneeId: newId });
    pushToast({ title: 'Новая задача', body: 'Уведомление участнику отправлено.' });
  };

  const { date, time } = fmtDate(deadline);

  const clearDeadline = () => setDeadline(undefined);
  const setDeadlineDate = (val: string) => {
    if (!val) {
      setDeadline(undefined);
      return;
    }
    const cur = deadline ? new Date(deadline) : new Date();
    const [y, m, d] = val.split('-').map(Number);
    cur.setFullYear(y, m - 1, d);
    setDeadline(cur.toISOString());
  };
  const setDeadlineTime = (val: string) => {
    if (!val) return;
    const cur = deadline ? new Date(deadline) : new Date();
    const [h, m] = val.split(':').map(Number);
    cur.setHours(h, m, 0, 0);
    setDeadline(cur.toISOString());
  };

  const overdue =
    deadline && new Date(deadline).getTime() < Date.now() && status !== 'done' && status !== 'review';

  return (
    <>
      <BigModal open={open} onClose={onClose} title="Задача">
        <div className="flex flex-col gap-5">
          {/* Название */}
          <div>
            <label className="block mb-2 font-semibold text-white">{t.taskForm.title}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-pill"
              maxLength={160}
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block mb-2 font-semibold text-white">{t.taskForm.description}</label>
            <textarea
              rows={4}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-box"
              placeholder={t.taskForm.descriptionPh}
            />
            <div className="text-right text-xs text-white/40 mt-1">{description.length}/500</div>
          </div>

          {/* Исполнитель */}
          <div>
            <label className="block mb-2 font-semibold text-white">{t.taskForm.assignee}</label>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-between gap-3 bg-white text-bg rounded-full px-3 py-2 hover:shadow-md transition"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-full bg-accent/40 flex items-center justify-center text-bg font-bold">
                  {assignee?.avatarUrl ? (
                    <img src={assignee.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (assignee?.name ?? assigneeId ?? '—').slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="truncate text-sm font-medium">
                  {assignee?.name ?? (assigneeId ? 'Участник' : t.taskForm.pickAssignee)}
                </span>
              </span>
              <span className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center">
                ▾
              </span>
            </button>
          </div>

          {/* Срок */}
          <div>
            <label className="block mb-2 font-semibold text-white">
              {t.taskForm.deadline}
              {overdue && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/30 text-red-200">
                  просрочено — сдвиньте срок
                </span>
              )}
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <input
                  type="date"
                  value={deadline ? new Date(deadline).toISOString().slice(0, 10) : ''}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="input-pill pl-9 w-44"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/70 pointer-events-none">
                  📅
                </span>
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="input-pill w-32 pr-9"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bg/60 pointer-events-none">
                  🕐
                </span>
              </div>
              <button
                type="button"
                aria-label="Очистить срок"
                onClick={clearDeadline}
                className="w-9 h-9 rounded-full bg-bg-card hover:bg-bg-panel text-white/50 hover:text-white"
              >
                ⊗
              </button>
            </div>
            {date && (
              <p className="text-xs text-white/40 mt-2">
                Текущее значение: {date}, {time}
              </p>
            )}
          </div>

          {/* Статус */}
          <div>
            <label className="block mb-2 font-semibold text-white">Статус</label>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${STATUS_BG[status]}`}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
              {STATUS_LABEL[status]}
            </span>
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-500/20 text-red-200 hover:bg-red-500/30 px-5 py-3 font-semibold text-sm transition"
            >
              <span aria-hidden>🗑</span>
              Удалить
            </button>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <button type="button" onClick={onClose} className="btn-ghost">
                {t.common.cancelUpper}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty}
                className="btn-accent-lg disabled:opacity-50"
              >
                {t.common.saveUpper}
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="inline-flex items-center justify-center rounded-2xl bg-lime-300 text-bg font-bold text-base px-8 py-3 shadow hover:bg-lime-400 transition"
              >
                {t.common.done.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </BigModal>

      <AssigneePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={handleAssigneeChange}
        projectId={task.projectId}
        currentAssigneeId={assigneeId}
      />
    </>
  );
}
