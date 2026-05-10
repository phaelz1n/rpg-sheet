import { LucideIcon } from 'lucide-react';

interface AttributeCardProps {
  name: string;
  value: number;
  level: string;
  icon: LucideIcon;
}

export function AttributeCard({ name, value, level, icon: Icon }: AttributeCardProps) {
  const valueColor = value >= 3 ? 'text-emerald-400' : value >= 1 ? 'text-amber-400' : value === 0 ? 'text-zinc-400' : 'text-red-400';
  const borderColor = value >= 3 ? 'border-emerald-900/50' : value >= 1 ? 'border-amber-900/50' : value === 0 ? 'border-zinc-700/50' : 'border-red-900/50';

  return (
    <div className={`bg-zinc-900/60 border-2 ${borderColor} rounded-lg p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-amber-900/30">
          <Icon className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-amber-300 uppercase tracking-wide text-sm">{name}</h3>
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className={`text-3xl font-bold ${valueColor}`}>
          {value >= 0 ? '+' : ''}{value}
        </span>
        <span className="text-zinc-500 text-sm italic">{level}</span>
      </div>
    </div>
  );
}
