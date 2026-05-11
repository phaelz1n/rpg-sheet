import { Eye, Hand, Heart, Brain, Sword, Flame, TrendingUp } from 'lucide-react';

interface GlobalAttributesPanelProps {
  attributes: {
    occultism: number;
    dexterity: number;
    vigor: number;
    willpower: number;
    strength: number;
    faith: number;
  };
  onAttributeChange?: (attribute: string, value: number) => void;
}

export function GlobalAttributesPanel({ attributes, onAttributeChange }: GlobalAttributesPanelProps) {
  const attributeList = [
    { key: 'occultism', label: 'Ocultismo', icon: Eye, color: 'purple' },
    { key: 'dexterity', label: 'Destreza', icon: Hand, color: 'emerald' },
    { key: 'vigor', label: 'Vigor', icon: Heart, color: 'red' },
    { key: 'willpower', label: 'Vontade', icon: Brain, color: 'blue' },
    { key: 'strength', label: 'Força', icon: Sword, color: 'orange' },
    { key: 'faith', label: 'Fé', icon: Flame, color: 'amber' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'text-purple-400 border-purple-900/60 bg-purple-950/30',
      emerald: 'text-emerald-400 border-emerald-900/60 bg-emerald-950/30',
      red: 'text-red-400 border-red-900/60 bg-red-950/30',
      blue: 'text-blue-400 border-blue-900/60 bg-blue-950/30',
      orange: 'text-orange-400 border-orange-900/60 bg-orange-950/30',
      amber: 'text-amber-400 border-amber-900/60 bg-amber-950/30'
    };
    return colors[color as keyof typeof colors] || colors.amber;
  };

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-black/95 border-2 border-amber-900/60 rounded-xl p-5 shadow-2xl sticky top-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-900/40">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        <h2 className="text-amber-400 uppercase tracking-wider">Atributos Globais</h2>
      </div>

      <p className="text-xs text-zinc-500 italic mb-4">
        Estes bônus são aplicados automaticamente a todos os itens do mesmo atributo.
      </p>

      <div className="space-y-3">
        {attributeList.map(({ key, label, icon: Icon, color }) => {
          const value = attributes[key as keyof typeof attributes];
          const colorClasses = getColorClasses(color);

          return (
            <div
              key={key}
              className={`${colorClasses} border rounded-lg p-3 transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${colorClasses.split(' ')[0]}`} />
                  <span className={`text-sm ${colorClasses.split(' ')[0]}`}>{label}</span>
                </div>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => onAttributeChange?.(key, Number(e.target.value))}
                  className={`w-16 bg-black/60 border border-amber-900/40 rounded px-2 py-1 ${colorClasses.split(' ')[0]} text-center text-lg focus:outline-none focus:border-amber-600`}
                />
              </div>
              <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorClasses.split(' ')[2]} transition-all duration-300`}
                  style={{ width: `${Math.min(Math.abs(value) * 20, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-amber-900/40">
        <div className="text-xs text-zinc-500 space-y-1">
          <p>💡 <span className="text-amber-400">Dica:</span> Bônus globais são adicionados ao bônus base de cada item.</p>
        </div>
      </div>
    </div>
  );
}
