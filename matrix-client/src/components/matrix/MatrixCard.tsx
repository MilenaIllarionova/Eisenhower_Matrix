import { useDraggable } from '@dnd-kit/core';
import { Task } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  task: Task;
  onOpen?: (task: Task) => void;
}

/**
 * Карточка задачи в квадранте. Клик — открыть детальную модалку.
 * Drag&Drop через @dnd-kit; чтобы клик не мешал перетаскиванию,
 * onOpen вызывается только если жест не перерос в drag.
 */
export default function MatrixCard({ task, onOpen }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwner = task.createdBy === currentUserId;
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !isOwner,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isOwner ? listeners : {})}
      onClick={() => {
        if (!isDragging) onOpen?.(task);
      }}
      className={`bg-white text-bg text-sm rounded-full px-4 py-2 select-none
        border border-bg/20 shadow-sm hover:shadow-md
        ${isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'opacity-60 ring-2 ring-accent' : ''}`}
      title={!isOwner ? 'Только владелец может перемещать задачу' : undefined}
    >
      {task.title}
    </div>
  );
}
