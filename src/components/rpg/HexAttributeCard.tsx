import { LucideIcon } from 'lucide-react';

interface HexAttributeCardProps {
  name: string;
  bonus: number;
  icon: LucideIcon;
  description?: string;
  onBonusChange?: (value: number) => void;
}

function getLevelLabel(bonus: number): string {
  if (bonus >= 5) return 'Lendário';
  if (bonus >= 4) return 'Mestre';
  if (bonus >= 3) return 'Especialista';
  if (bonus >= 2) return 'Competente';
  if (bonus >= 1) return 'Aprendiz';
  if (bonus === 0) return 'Humano';
  return 'Fraco';
}

export function HexAttributeCard({ name, bonus, icon: Icon, description, onBonusChange }: HexAttributeCardProps) {
  const level = getLevelLabel(bonus);

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
    <div className={`relative bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 ${borderColor} rounded-lg p-4 shadow-xl ${glowColor} hover:scale-105 transition-all group`}>
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

      {description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-950 border border-amber-800/50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
          <div className="text-amber-500 text-[10px] uppercase tracking-widest font-bold mb-1 border-b border-amber-900/30 pb-1">
            {name}
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
