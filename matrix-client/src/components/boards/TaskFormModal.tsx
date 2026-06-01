import { FormEvent, useEffect, useState } from 'react';
import BigModal from '../common/BigModal';
import { Quadrant, QUADRANTS, QUADRANT_LABEL, Project } from '../../types';
import { t } from '../../i18n/ru';
import { useProjectsStore } from '../../store/useProjectsStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    description?: string;
    quadrant: Quadrant;
    deadline?: string;
    projectId?: string;
  }) => Promise<void>;
  /** Если true — поле «Срок» заранее заполнено сегодняшней датой (для «Крайний срок»). */
  burning?: boolean;
  defaultProjectId?: string;
  defaultQuadrant?: Quadrant;
}

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  burning,
  defaultProjectId,
  defaultQuadrant,
}: Props) {
  const projects = useProjectsStore((s) => s.projects);
  const fetchProjects = useProjectsStore((s) => s.fetchAll);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(burning ? todayISODate() : '');
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant ?? 'urgent_important');
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchProjects().catch(() => undefined);
  }, [open, fetchProjects]);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setDate(burning ? todayISODate() : '');
      setQuadrant(defaultQuadrant ?? 'urgent_important');
      setProjectId(defaultProjectId ?? '');
    }
  }, [open, burning, defaultProjectId, defaultQuadrant]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description: description || undefined,
        quadrant,
        deadline: date ? new Date(`${date}T23:59`).toISOString() : undefined,
        projectId: projectId || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BigModal open={open} onClose={onClose} title={t.common.addTask}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Название */}
        <div>
          <label className="block mb-2 font-semibold text-white">{t.taskForm.title}</label>
          <input
            type="text"
            required
            maxLength={160}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.taskForm.titlePh}
            className="input-pill"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block mb-2 font-semibold text-white">
            {t.taskForm.description}{' '}
            <span className="text-white/40 font-normal">({t.common.optional})</span>
          </label>
          <textarea
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.taskForm.descriptionPh}
            className="textarea-box"
          />
          <div className="text-right text-xs text-white/40 mt-1">{description.length}/500</div>
        </div>

        {/* Срок и приоритет в одну строку */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold text-white">
              {t.taskForm.deadline}{' '}
              <span className="text-white/40 font-normal">({t.common.optional})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bg/70">📅</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-pill pl-9"
                placeholder={burning ? t.taskForm.today : t.taskForm.pickDate}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">{t.taskForm.priority}</label>
            <div className="relative">
              <select
                value={quadrant}
                onChange={(e) => setQuadrant(e.target.value as Quadrant)}
                className="select-pill pr-10"
              >
                {QUADRANTS.map((q) => (
                  <option key={q} value={q}>
                    {QUADRANT_LABEL[q]}
                  </option>
                ))}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center pointer-events-none">
                ▾
              </span>
            </div>
          </div>
        </div>

        {/* Доска */}
        <div>
          <label className="block mb-2 font-semibold text-white">{t.taskForm.board}</label>
          <div className="relative">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="select-pill pr-10"
            >
              <option value="">{t.taskForm.pickBoard}</option>
              {projects.map((p: Project) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-center gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost">
            {t.common.cancelUpper}
          </button>
          <button type="submit" className="btn-accent-lg" disabled={submitting || !title.trim()}>
            {submitting ? '...' : t.common.saveUpper}
          </button>
        </div>
      </form>
    </BigModal>
  );
}
