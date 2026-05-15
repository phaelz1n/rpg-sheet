import { Shield } from 'lucide-react';

interface DamageReductionBadgeProps {
  value: number;
  onValueChange?: (value: number) => void;
}

export function DamageReductionBadge({ value, onValueChange }: DamageReductionBadgeProps) {
  return (
    <div className="bg-gradient-to-br from-blue-950/50 to-zinc-900/80 border-2 border-blue-800/60 rounded-lg p-4 shadow-xl flex flex-col items-center justify-center relative group">
      <Shield className="w-8 h-8 text-blue-400 mb-2" />
      <div className="text-xs text-blue-300 uppercase tracking-wider mb-1">Redução de Dano</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className="w-16 bg-transparent border-b border-blue-800/50 text-center text-4xl text-blue-400 focus:outline-none focus:border-blue-500"
        min={0}
      />

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-blue-800/50 rounded p-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
        <div className="text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-1 border-b border-blue-900/30 pb-1">
          Proteção Física
        </div>
        <p className="text-zinc-300 text-[10px] leading-tight">
          Valor subtraído de todo dano físico recebido antes de afetar sua Vida.
        </p>
      </div>
    </div>
  );
}
