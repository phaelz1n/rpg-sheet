import { LucideIcon } from 'lucide-react';

interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  icon: LucideIcon;
  color: string;
  onCurrentChange?: (value: number) => void;
}

export function StatusBar({ label, current, max, icon: Icon, color, onCurrentChange }: StatusBarProps) {
  const percentage = (current / max) * 100;

  const colorClasses = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
  }[color] || 'bg-amber-600';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-amber-500" />
          <label className="text-amber-400/80 text-sm uppercase tracking-wide">{label}</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={current}
            onChange={(e) => onCurrentChange?.(Number(e.target.value))}
            className="w-12 bg-black/40 border border-amber-900/30 rounded px-2 py-1 text-amber-100 text-center text-sm focus:outline-none focus:border-amber-600"
            min={0}
            max={max}
          />
          <span className="text-zinc-500">/</span>
          <span className="text-amber-300">{max}</span>
        </div>
      </div>

      <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-amber-900/30">
        <div
          className={`h-full ${colorClasses} transition-all duration-300 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
