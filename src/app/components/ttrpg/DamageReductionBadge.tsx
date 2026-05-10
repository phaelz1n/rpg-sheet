import { Shield } from 'lucide-react';

interface DamageReductionBadgeProps {
  value: number;
}

export function DamageReductionBadge({ value }: DamageReductionBadgeProps) {
  return (
    <div className="bg-gradient-to-br from-blue-950/50 to-zinc-900/80 border-2 border-blue-800/60 rounded-lg p-4 shadow-xl flex flex-col items-center justify-center">
      <Shield className="w-8 h-8 text-blue-400 mb-2" />
      <div className="text-xs text-blue-300 uppercase tracking-wider mb-1">Redução de Dano</div>
      <div className="text-4xl text-blue-400">{value}</div>
    </div>
  );
}
