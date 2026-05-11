import { Package } from 'lucide-react';

interface EncumbranceBarProps {
  current: number;
  max: number;
}

export function EncumbranceBar({ current, max }: EncumbranceBarProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 75;
  const isFull = current >= max;

  return (
    <div className="bg-zinc-900/60 border border-amber-900/40 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-600" />
          <span className="text-amber-400 text-xs uppercase tracking-wider">Carga</span>
        </div>
        <span className={`text-sm tabular-nums ${
          isFull ? 'text-red-400' : isNearLimit ? 'text-orange-400' : 'text-amber-300'
        }`}>
          {current} / {max}
        </span>
      </div>

      <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-amber-900/40">
        <div
          className={`h-full transition-all duration-500 shadow-lg ${
            isFull ? 'bg-gradient-to-r from-red-700 to-red-600 shadow-red-900/50' :
            isNearLimit ? 'bg-gradient-to-r from-orange-700 to-amber-600 shadow-orange-900/50' :
            'bg-gradient-to-r from-amber-700 to-yellow-600 shadow-amber-900/50'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {isFull && (
        <p className="text-red-400 text-xs mt-2 text-center">Inventário Cheio</p>
      )}
      {isNearLimit && !isFull && (
        <p className="text-orange-400 text-xs mt-2 text-center">Quase Cheio</p>
      )}
    </div>
  );
}
