import React from 'react';
import { 
  Skull, Flame, Eye, Hand, Heart, Brain, Sword, Target, 
  Droplet, Zap, Dumbbell, Beaker, Thermometer, Droplets, 
  Activity, Info
} from 'lucide-react';

interface RichDescriptionProps {
  text: string;
  className?: string;
}

export function RichDescription({ text, className = "" }: RichDescriptionProps) {
  if (!text) return null;

  // Pattern to match #hashtags and [brackets]
  const parts = text.split(/(#[a-záàâãéèêíïóôõöúç]+|\[marcado\])/gi);

  const iconMap: Record<string, { icon: any, color: string, label: string }> = {
    // Atributos
    '#corrupção': { icon: Skull, color: 'text-purple-500', label: 'Corrupção' },
    '#corrupcao': { icon: Skull, color: 'text-purple-500', label: 'Corrupção' },
    '#fé': { icon: Droplet, color: 'text-blue-400', label: 'Fé' },
    '#fe': { icon: Droplet, color: 'text-blue-400', label: 'Fé' },
    '#ocultismo': { icon: Eye, color: 'text-purple-400', label: 'Ocultismo' },
    '#destreza': { icon: Zap, color: 'text-emerald-400', label: 'Destreza' },
    '#vigor': { icon: Heart, color: 'text-red-500', label: 'Vigor' },
    '#vontade': { icon: Brain, color: 'text-blue-500', label: 'Vontade' },
    '#força': { icon: Dumbbell, color: 'text-orange-500', label: 'Força' },
    '#forca': { icon: Dumbbell, color: 'text-orange-500', label: 'Força' },
    
    // Status / Condições
    '[marcado]': { icon: Target, color: 'text-red-400', label: 'Marcado' },
    '#envenenado': { icon: Beaker, color: 'text-green-500', label: 'Envenenado' },
    '#queimadura': { icon: Flame, color: 'text-orange-600', label: 'Queimadura' },
    '#queimado': { icon: Flame, color: 'text-orange-600', label: 'Queimado' },
    '#molhado': { icon: Droplets, color: 'text-blue-400', label: 'Molhado' },
    '#sangramento': { icon: Activity, color: 'text-red-600', label: 'Sangramento' },
    '#sangrando': { icon: Activity, color: 'text-red-600', label: 'Sangrando' },
    '#congelado': { icon: Droplets, color: 'text-cyan-300', label: 'Congelado' },
    '#paralisado': { icon: Zap, color: 'text-yellow-400', label: 'Paralisado' },
  };

  return (
    <span className={`inline whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const iconConfig = iconMap[lowerPart];

        if (iconConfig) {
          const Icon = iconConfig.icon;
          return (
            <span key={index} className="inline-flex items-center group/icon relative mx-0.5 align-middle">
              <Icon className={`w-4 h-4 ${iconConfig.color} drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]`} />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-zinc-200 opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                {iconConfig.label}
              </span>
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
