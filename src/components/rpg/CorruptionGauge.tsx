import { Crown, Skull } from 'lucide-react';

interface CorruptionGaugeProps {
  current: number;
  max: number;
  onCurrentChange?: (value: number) => void;
  onMaxChange?: (value: number) => void;
}

export function CorruptionGauge({ current, max, onCurrentChange, onMaxChange }: CorruptionGaugeProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-purple-950/40 to-black/60 border border-purple-900/50 rounded-lg p-3 shadow-lg w-full relative group">
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-zinc-950 border border-purple-800/50 rounded p-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
        <div className="text-purple-400 text-[10px] uppercase tracking-widest font-bold mb-1 border-b border-purple-900/30 pb-1">
          Nível de Corrupção
        </div>
        <p className="text-zinc-300 text-[10px] leading-tight">
          Representa o quanto sua alma foi tocada pelo abismo. Se ultrapassar o limite, consequências terríveis ocorrerão.
        </p>
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          <Skull className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-purple-400 uppercase tracking-wider text-xs truncate">Corrupção</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-amber-500 text-xs whitespace-nowrap">Limite:</span>
          <input
            type="number"
            value={max}
            onChange={(e) => onMaxChange?.(Math.max(1, Number(e.target.value)))}
            className="w-8 bg-transparent border-b border-amber-800/50 text-center text-xs text-amber-400 focus:outline-none focus:border-amber-500"
            min={1}
            title="Limite de Corrupção (automático via itens equipados)"
          />
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
