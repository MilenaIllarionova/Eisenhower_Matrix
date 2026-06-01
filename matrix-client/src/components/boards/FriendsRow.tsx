interface Person {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Props {
  people: Person[];
  size?: 'sm' | 'md';
}

export default function FriendsRow({ people, size = 'md' }: Props) {
  if (people.length === 0) {
    return <p className="text-sm text-white/40">Пока никого</p>;
  }
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <div className="flex -space-x-2">
      {people.slice(0, 5).map((p) => (
        <div
          key={p.id}
          className={`${dim} rounded-full bg-accent/40 border-2 border-bg-panel
                     flex items-center justify-center font-semibold text-white overflow-hidden`}
          title={p.name}
        >
          {p.avatarUrl ? (
            <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            p.name.slice(0, 1).toUpperCase()
          )}
        </div>
      ))}
      {people.length > 5 && (
        <div
          className={`${dim} rounded-full bg-bg-card border-2 border-bg-panel
                     flex items-center justify-center text-xs text-white/70`}
        >
          +{people.length - 5}
        </div>
      )}
    </div>
  );
}
