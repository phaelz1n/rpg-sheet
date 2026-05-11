import { LucideIcon } from 'lucide-react';

interface SkillCardProps {
  name: string;
  description: string;
  bonus: number;
  icon: LucideIcon;
  color: string;
  onBonusChange: (value: number) => void;
}

export function SkillCard({ name, description, bonus, icon: Icon, color, onBonusChange }: SkillCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-950/30 to-zinc-900/80 border-emerald-900/50',
    orange: 'from-orange-950/30 to-zinc-900/80 border-orange-900/50',
    blue: 'from-blue-950/30 to-zinc-900/80 border-blue-900/50',
    purple: 'from-purple-950/30 to-zinc-900/80 border-purple-900/50',
    amber: 'from-amber-950/30 to-zinc-900/80 border-amber-900/50'
  };

  const iconColors = {
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border-2 rounded-lg p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-start sm:items-center justify-between mb-2 gap-2 flex-col sm:flex-row">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColors[color as keyof typeof iconColors]}`} />
          <h3 className="text-amber-300 font-bold text-xs sm:text-sm">{name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs">Bônus:</span>
          <input
            type="number"
            value={bonus}
            onChange={(e) => onBonusChange(Number(e.target.value))}
            className="w-12 sm:w-14 bg-black/40 border border-amber-900/40 rounded px-2 py-1 text-amber-400 text-center text-xs sm:text-sm focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>
      <p className="text-zinc-400 text-xs leading-relaxed">{description}</p>
    </div>
  );
}
