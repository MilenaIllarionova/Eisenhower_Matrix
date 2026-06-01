import { ReactNode } from 'react';
import { PlusIcon } from '../common/Icons';

interface Props {
  title: string;
  onAdd?: () => void;
  children: ReactNode;
}

export default function SidePanel({ title, onAdd, children }: Props) {
  return (
    <section className="panel">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Добавить в «${title}»`}
            className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center hover:bg-accent-dark transition"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}
