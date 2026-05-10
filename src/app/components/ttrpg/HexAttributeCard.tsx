import { LucideIcon } from 'lucide-react';

interface HexAttributeCardProps {
  name: string;
  bonus: number;
  level: string;
  icon: LucideIcon;
  onBonusChange?: (value: number) => void;
}

export function HexAttributeCard({ name, bonus, level, icon: Icon, onBonusChange }: HexAttributeCardProps) {
  const bonusColor = bonus >= 3 ? 'text-emerald-400' :
                     bonus >= 1 ? 'text-amber-400' :
                     bonus === 0 ? 'text-zinc-400' :
                     'text-rose-500';

  const borderColor = bonus >= 3 ? 'border-emerald-900/60' :
                      bonus >= 1 ? 'border-amber-900/60' :
                      bonus === 0 ? 'border-zinc-700/60' :
                      'border-rose-900/60';

  const glowColor = bonus >= 3 ? 'shadow-emerald-900/30' :
                    bonus >= 1 ? 'shadow-amber-900/30' :
                    '';

  return (
    <div className={`relative bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 ${borderColor} rounded-lg p-4 shadow-xl ${glowColor} hover:scale-105 transition-transform`}>
      {/* Hexagonal background accent */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,5 90,30 90,70 50,95 10,70 10,30" fill="currentColor" className="text-amber-600" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center border border-amber-800/50">
            <Icon className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-amber-400/90 uppercase tracking-wide text-xs">{name}</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-zinc-500 text-xs">2d6</span>
            <input
              type="number"
              value={bonus}
              onChange={(e) => onBonusChange?.(Number(e.target.value))}
              className={`w-16 bg-transparent border-b border-amber-900/40 text-center text-3xl tracking-tight ${bonusColor} focus:outline-none focus:border-amber-600`}
            />
          </div>
          <span className="text-zinc-500 text-xs italic">{level}</span>
        </div>
      </div>
    </div>
  );
}
