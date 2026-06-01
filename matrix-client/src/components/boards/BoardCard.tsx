import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n/ru';

interface Props {
  id: string;
  name: string;
  description?: string;
  members: number;
  tasks: number;
  progress?: { done: number; total: number };
}

export default function BoardCard({ id, name, description, members, tasks, progress }: Props) {
  const navigate = useNavigate();
  const pct = progress && progress.total > 0
    ? `${Math.round((progress.done / progress.total) * 100)}%`
    : '0%';

  const hasProgress = progress && progress.total > 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/tasks?boardId=${id}`)}
      className="text-left bg-white text-bg rounded-2xl p-5 flex flex-col h-44
                 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition"
    >
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-sm text-bg/60 mt-1 line-clamp-2">{description ?? '—'}</p>

      {/* Прогрессбар */}
      <div className="mt-3 w-full">
        <div className="h-1.5 bg-bg/10 rounded-full w-full">
          <div
            style={{ width: pct }}
            className="h-1.5 bg-accent rounded-full transition-all duration-500"
          />
        </div>
        {hasProgress && (
          <p className="text-[11px] text-bg/50 mt-1">
            {progress!.done} / {progress!.total} выполнено ({pct})
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 text-[11px] text-bg/60">
        <span>{members} {t.boards.participantsTasks.split(' | ')[0]}</span>
        <span className="w-px h-3 bg-bg/30" />
        <span>{tasks} {t.boards.participantsTasks.split(' | ')[1]}</span>
      </div>
    </button>
  );
}

