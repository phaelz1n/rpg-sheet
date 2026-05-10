import { Crown, Skull } from 'lucide-react';

interface CorruptionGaugeProps {
  current: number;
  max: number;
  limit: string;
  onCurrentChange?: (value: number) => void;
}

export function CorruptionGauge({ current, max, limit, onCurrentChange }: CorruptionGaugeProps) {
  const percentage = (current / max) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-950/40 to-black/60 border border-purple-900/50 rounded-lg p-3 shadow-lg w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          <Skull className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-purple-400 uppercase tracking-wider text-xs truncate">Corrupção</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-amber-500 text-xs whitespace-nowrap">{limit}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-2">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onCurrentChange?.(i + 1 === current ? i : i + 1)}
            className={`flex-1 min-w-0 h-3 rounded-sm border transition-all ${
              i < current
                ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                : 'bg-black/60 border-purple-900/40 hover:border-purple-700'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-purple-300 tabular-nums">{current}/{max}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
          percentage >= 70 ? 'bg-red-900/50 text-red-300' :
          percentage >= 40 ? 'bg-purple-900/50 text-purple-300' :
          'bg-zinc-800/50 text-zinc-400'
        }`}>
          {percentage >= 70 ? 'Crítico' : percentage >= 40 ? 'Contaminado' : 'Estável'}
        </span>
      </div>
    </div>
  );
}
