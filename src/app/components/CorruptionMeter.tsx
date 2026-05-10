import { Crown, Skull } from 'lucide-react';

interface CorruptionMeterProps {
  current: number;
  max: number;
  limit: string;
  onCurrentChange?: (value: number) => void;
}

export function CorruptionMeter({ current, max, limit, onCurrentChange }: CorruptionMeterProps) {
  const percentage = (current / max) * 100;
  const getCorruptionColor = () => {
    if (percentage >= 75) return 'bg-gradient-to-r from-purple-900 to-red-900';
    if (percentage >= 50) return 'bg-gradient-to-r from-purple-700 to-purple-900';
    if (percentage >= 25) return 'bg-gradient-to-r from-violet-600 to-purple-700';
    return 'bg-violet-600';
  };

  const getStatusText = () => {
    if (percentage >= 75) return 'Critical';
    if (percentage >= 50) return 'Tainted';
    if (percentage >= 25) return 'Marked';
    return 'Pure';
  };

  return (
    <div className="bg-zinc-900/60 border-2 border-purple-900/50 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-purple-500" />
          <h3 className="text-purple-400 uppercase tracking-wide">Corruption</h3>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-600" />
          <span className="text-amber-400 text-sm">{limit}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
              <button
                key={i}
                onClick={() => onCurrentChange?.(i + 1)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  i < current
                    ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                    : 'bg-black/40 border-purple-900/30 hover:border-purple-700'
                }`}
              >
                <span className="text-xs text-purple-300">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            {current} / {max}
          </span>
          <span className={`px-3 py-1 rounded-full ${
            percentage >= 75 ? 'bg-red-900/50 text-red-300' :
            percentage >= 50 ? 'bg-purple-900/50 text-purple-300' :
            percentage >= 25 ? 'bg-violet-900/50 text-violet-300' :
            'bg-zinc-800/50 text-zinc-400'
          }`}>
            {getStatusText()}
          </span>
        </div>

        <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-purple-900/30">
          <div
            className={`h-full ${getCorruptionColor()} transition-all duration-300 shadow-lg`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
