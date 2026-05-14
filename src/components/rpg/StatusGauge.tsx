import { LucideIcon } from 'lucide-react';

interface StatusGaugeProps {
  label: string;
  current: number;
  max: number;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'purple' | 'green' | 'crimson' | 'amber' | 'emerald';
  onCurrentChange?: (value: number) => void;
  onMaxChange?: (value: number) => void;
}

export function StatusGauge({ label, current, max, icon: Icon, color, onCurrentChange, onMaxChange }: StatusGaugeProps) {
  const percentage = (current / max) * 100;

  const colorMap = {
    red: { bar: 'bg-red-700', glow: 'shadow-red-900/50' },
    blue: { bar: 'bg-blue-700', glow: 'shadow-blue-900/50' },
    purple: { bar: 'bg-purple-700', glow: 'shadow-purple-900/50' },
    green: { bar: 'bg-emerald-700', glow: 'shadow-emerald-900/50' },
    crimson: { bar: 'bg-rose-800', glow: 'shadow-rose-900/50' },
    amber: { bar: 'bg-amber-600', glow: 'shadow-amber-900/50' },
    emerald: { bar: 'bg-emerald-600', glow: 'shadow-emerald-900/50' }
  };

  const colors = colorMap[color];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          <Icon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-amber-400/90 uppercase tracking-wider truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number"
            value={current}
            onChange={(e) => onCurrentChange?.(Number(e.target.value))}
            className="w-8 bg-black/60 border border-amber-900/40 rounded px-1 py-0.5 text-amber-300 text-center text-xs focus:outline-none focus:border-amber-600"
            min={0}
            max={max}
          />
          <span className="text-zinc-500">/</span>
          <input
            type="number"
            value={max}
            onChange={(e) => onMaxChange?.(Number(e.target.value))}
            className="w-8 bg-black/60 border border-amber-900/40 rounded px-1 py-0.5 text-amber-300 text-center text-xs focus:outline-none focus:border-amber-600"
            min={1}
          />
        </div>
      </div>
      <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-amber-900/40">
        <div
          className={`h-full ${colors.bar} transition-all duration-500 shadow-lg ${colors.glow}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
