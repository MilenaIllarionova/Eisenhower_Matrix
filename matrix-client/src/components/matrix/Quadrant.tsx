import { useDroppable } from '@dnd-kit/core';
import { Quadrant, QUADRANT_COLOR, QUADRANT_LABEL, Task } from '../../types';
import MatrixCard from './MatrixCard';
import { PlusIcon } from '../common/Icons';

interface Props {
  quadrant: Quadrant;
  tasks: Task[];
  onAdd?: (quadrant: Quadrant) => void;
  onCardOpen?: (task: Task) => void;
}

export default function QuadrantColumn({ quadrant, tasks, onAdd, onCardOpen }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `q:${quadrant}`,
    data: { quadrant },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-5 min-h-[260px] flex flex-col gap-3 transition
        ${QUADRANT_COLOR[quadrant]} ${isOver ? 'ring-2 ring-bg' : ''}`}
    >
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-bg text-base">{QUADRANT_LABEL[quadrant]}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(quadrant)}
            aria-label="Добавить задачу"
            className="w-7 h-7 rounded-full bg-bg/10 hover:bg-bg/20 text-bg flex items-center justify-center"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        )}
      </header>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-bg/50">Перетащите задачи сюда</p>
        ) : (
          tasks.map((tk) => <MatrixCard key={tk.id} task={tk} onOpen={onCardOpen} />)
        )}
      </div>
    </div>
  );
}
