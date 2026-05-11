import React from 'react';
import { 
  Skull, Flame, Eye, Hand, Heart, Brain, Sword, Target, 
  Droplet, Zap, Dumbbell, Beaker, Thermometer, Droplets, 
  Activity, Info, Shield
} from 'lucide-react';

interface RichDescriptionProps {
  text: string;
  className?: string;
}

export function RichDescription({ text, className = "" }: RichDescriptionProps) {
  if (!text) return null;

  // Pattern to match #hashtags and [brackets]
  const parts = text.split(/(#[a-záàâãéèêíïóôõöúç]+|\[[a-záàâãéèêíïóôõöúç\s]+\])/gi);

  type TagType = 'hashtag' | 'badge';
  const iconMap: Record<string, { icon: any, color: string, label: string, type: TagType, bgColor?: string, borderColor?: string }> = {
    // Atributos
    '#corrupção': { icon: Skull, color: 'text-purple-500', label: 'Corrupção', type: 'hashtag' },
    '#corrupcao': { icon: Skull, color: 'text-purple-500', label: 'Corrupção', type: 'hashtag' },
    '#fé': { icon: Droplet, color: 'text-blue-400', label: 'Fé', type: 'hashtag' },
    '#fe': { icon: Droplet, color: 'text-blue-400', label: 'Fé', type: 'hashtag' },
    '#fôlego': { icon: Flame, color: 'text-green-400', label: 'Fôlego', type: 'hashtag' },
    '#folego': { icon: Flame, color: 'text-green-400', label: 'Fôlego', type: 'hashtag' },
    '#stamina': { icon: Flame, color: 'text-green-400', label: 'Stamina', type: 'hashtag' },
    '#ocultismo': { icon: Eye, color: 'text-purple-400', label: 'Ocultismo', type: 'hashtag' },
    '#destreza': { icon: Zap, color: 'text-emerald-400', label: 'Destreza', type: 'hashtag' },
    '#vigor': { icon: Heart, color: 'text-red-500', label: 'Vigor', type: 'hashtag' },
    '#vontade': { icon: Brain, color: 'text-blue-500', label: 'Vontade', type: 'hashtag' },
    '#força': { icon: Dumbbell, color: 'text-orange-500', label: 'Força', type: 'hashtag' },
    '#forca': { icon: Dumbbell, color: 'text-orange-500', label: 'Força', type: 'hashtag' },
    
    // Status / Condições (Badges)
    '#marcado': { icon: Target, color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-900/50', label: 'Marcado', type: 'badge' },
    '#envenenado': { icon: Beaker, color: 'text-green-500', bgColor: 'bg-green-950/40', borderColor: 'border-green-900/50', label: 'Envenenado', type: 'badge' },
    '#queimando': { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-900/50', label: 'Queimando', type: 'badge' },
    '#sangrando': { icon: Activity, color: 'text-red-600', bgColor: 'bg-red-950/40', borderColor: 'border-red-900/50', label: 'Sangrando', type: 'badge' },
    '#congelado': { icon: Droplets, color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-900/50', label: 'Congelado', type: 'badge' },
    '#paralisado': { icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-900/50', label: 'Paralisado', type: 'badge' },
    '#vulnerável': { icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Vulnerável', type: 'badge' },
    '#vulneravel': { icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Vulnerável', type: 'badge' },
    '#rd': { icon: Shield, color: 'text-zinc-300', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-600', label: 'Redução de Dano', type: 'badge' },
  };

  return (
    <span className={`inline whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        const iconConfig = iconMap[lowerPart];

        if (iconConfig) {
          const Icon = iconConfig.icon;
          
          if (iconConfig.type === 'badge') {
            return (
              <span key={index} className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded ${iconConfig.bgColor} border ${iconConfig.borderColor} ${iconConfig.color} align-baseline text-[10px] font-bold uppercase tracking-wider`}>
                <Icon className="w-3 h-3" />
                {iconConfig.label}
              </span>
            );
          } else {
            return (
              <span key={index} className="inline-flex items-center gap-1 mx-0.5 font-semibold align-baseline">
                <Icon className={`w-3.5 h-3.5 ${iconConfig.color} drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]`} />
                <span className={`${iconConfig.color}`}>{iconConfig.label}</span>
              </span>
            );
          }
        }

        // Se for um bracket que não está mapeado, renderizar como tag cinza
        if (lowerPart.startsWith('[') && lowerPart.endsWith(']')) {
          const content = part.slice(1, -1);
          return (
            <span key={index} className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 align-baseline text-[10px] font-bold uppercase tracking-wider">
              {content}
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
