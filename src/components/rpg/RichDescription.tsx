import React from 'react';
import { 
  Skull, Flame, Eye, Hand, Heart, Brain, Sword, Target, 
  Droplet, Zap, Dumbbell, Beaker, Droplets, Activity, Shield,
  VolumeX, Moon, Sun, Sprout, Mountain, Volume2, Bomb, Crosshair, Sparkles
} from 'lucide-react';

interface RichDescriptionProps {
  text: string;
  className?: string;
}

export function RichDescription({ text, className = "" }: RichDescriptionProps) {
  if (!text || typeof text !== 'string') return null;

  // Pattern to match #hashtags and [brackets] including all Portuguese accented letters
  const parts = text.split(/(#[a-záàâãäéèêëíìîïóòôõöúùûüçñ]+|\[[a-záàâãäéèêëíìîïóòôõöúùûüçñ\s]+\])/gi);

  type TagType = 'hashtag' | 'badge';
  const iconMap: Record<string, { icon: any, color: string, label: string, type: TagType, bgColor?: string, borderColor?: string }> = {
    // --- Atributos ---
    '#força': { icon: Dumbbell, color: 'text-orange-500', label: 'Força', type: 'hashtag' },
    '#forca': { icon: Dumbbell, color: 'text-orange-500', label: 'Força', type: 'hashtag' },
    '#destreza': { icon: Zap, color: 'text-emerald-400', label: 'Destreza', type: 'hashtag' },
    '#vigor': { icon: Heart, color: 'text-red-500', label: 'Vigor', type: 'hashtag' },
    '#vontade': { icon: Brain, color: 'text-blue-500', label: 'Vontade', type: 'hashtag' },
    '#fé': { icon: Flame, color: 'text-amber-500', label: 'Fé', type: 'hashtag' },
    '#fe': { icon: Flame, color: 'text-amber-500', label: 'Fé', type: 'hashtag' },
    '#ocultismo': { icon: Eye, color: 'text-purple-400', label: 'Ocultismo', type: 'hashtag' },

    // --- Recursos ---
    '#vida': { icon: Heart, color: 'text-red-500', label: 'Vida', type: 'hashtag' },
    '#hp': { icon: Heart, color: 'text-red-500', label: 'HP', type: 'hashtag' },
    '#mana': { icon: Droplet, color: 'text-blue-400', label: 'Mana', type: 'hashtag' },
    '#stamina': { icon: Zap, color: 'text-green-400', label: 'Stamina', type: 'hashtag' },
    '#fôlego': { icon: Zap, color: 'text-green-400', label: 'Fôlego', type: 'hashtag' },
    '#folego': { icon: Zap, color: 'text-green-400', label: 'Fôlego', type: 'hashtag' },
    '#sanidade': { icon: Brain, color: 'text-teal-400', label: 'Sanidade', type: 'hashtag' },
    '#corrupção': { icon: Skull, color: 'text-purple-500', label: 'Corrupção', type: 'hashtag' },
    '#corrupcao': { icon: Skull, color: 'text-purple-500', label: 'Corrupção', type: 'hashtag' },

    // --- Perícias ---
    '#acrobacia': { icon: Hand, color: 'text-emerald-500', label: 'Acrobacia', type: 'hashtag' },
    '#furtividade': { icon: Hand, color: 'text-emerald-500', label: 'Furtividade', type: 'hashtag' },
    '#pontaria': { icon: Hand, color: 'text-emerald-500', label: 'Pontaria', type: 'hashtag' },
    '#atletismo': { icon: Sword, color: 'text-orange-500', label: 'Atletismo', type: 'hashtag' },
    '#intimidação': { icon: Sword, color: 'text-orange-500', label: 'Intimidação', type: 'hashtag' },
    '#intimidacao': { icon: Sword, color: 'text-orange-500', label: 'Intimidação', type: 'hashtag' },
    '#percepção': { icon: Brain, color: 'text-blue-500', label: 'Percepção', type: 'hashtag' },
    '#percepcao': { icon: Brain, color: 'text-blue-500', label: 'Percepção', type: 'hashtag' },
    '#sobrevivência': { icon: Brain, color: 'text-blue-500', label: 'Sobrevivência', type: 'hashtag' },
    '#sobrevivencia': { icon: Brain, color: 'text-blue-500', label: 'Sobrevivência', type: 'hashtag' },
    '#medicina': { icon: Brain, color: 'text-blue-500', label: 'Medicina', type: 'hashtag' },
    '#presença': { icon: Flame, color: 'text-amber-500', label: 'Presença', type: 'hashtag' },
    '#presenca': { icon: Flame, color: 'text-amber-500', label: 'Presença', type: 'hashtag' },

    // --- Efeitos / Condições ---
    '#sangramento': { icon: Activity, color: 'text-red-600', bgColor: 'bg-red-950/40', borderColor: 'border-red-900/50', label: 'Sangramento', type: 'badge' },
    '#sangrando': { icon: Activity, color: 'text-red-600', bgColor: 'bg-red-950/40', borderColor: 'border-red-900/50', label: 'Sangrando', type: 'badge' },
    '#congelado': { icon: Droplets, color: 'text-cyan-400', bgColor: 'bg-cyan-950/40', borderColor: 'border-cyan-900/50', label: 'Congelado', type: 'badge' },
    '#eletrocutado': { icon: Zap, color: 'text-yellow-300', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-900/50', label: 'Eletrocutado', type: 'badge' },
    '#envenenado': { icon: Beaker, color: 'text-green-500', bgColor: 'bg-green-950/40', borderColor: 'border-green-900/50', label: 'Envenenado', type: 'badge' },
    '#exausto': { icon: Heart, color: 'text-zinc-500', bgColor: 'bg-zinc-950/40', borderColor: 'border-zinc-800', label: 'Exausto', type: 'badge' },
    '#queimando': { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-900/50', label: 'Queimando', type: 'badge' },
    '#queimado': { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-900/50', label: 'Queimado', type: 'badge' },
    '#louco': { icon: Skull, color: 'text-pink-500', bgColor: 'bg-pink-950/40', borderColor: 'border-pink-900/50', label: 'Louco', type: 'badge' },
    '#corte': { icon: Sword, color: 'text-zinc-400', bgColor: 'bg-zinc-950/40', borderColor: 'border-zinc-800', label: 'Corte', type: 'badge' },
    '#paralisado': { icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-900/50', label: 'Paralisado', type: 'badge' },
    '#nojo': { icon: Beaker, color: 'text-lime-500', bgColor: 'bg-lime-950/40', borderColor: 'border-lime-900/50', label: 'Nojo', type: 'badge' },
    '#cego': { icon: Eye, color: 'text-zinc-600', bgColor: 'bg-zinc-950/40', borderColor: 'border-zinc-900', label: 'Cego', type: 'badge' },
    '#surdo': { icon: VolumeX, color: 'text-zinc-400', bgColor: 'bg-zinc-950/40', borderColor: 'border-zinc-800', label: 'Surdo', type: 'badge' },
    '#infecção': { icon: Skull, color: 'text-emerald-600', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-900/50', label: 'Infecção', type: 'badge' },
    '#infeccao': { icon: Skull, color: 'text-emerald-600', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-900/50', label: 'Infecção', type: 'badge' },
    '#amedrontado': { icon: Brain, color: 'text-indigo-400', bgColor: 'bg-indigo-950/40', borderColor: 'border-indigo-900/50', label: 'Amedrontado', type: 'badge' },
    '#corrosão': { icon: Beaker, color: 'text-yellow-600', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-900/50', label: 'Corrosão', type: 'badge' },
    '#corrosao': { icon: Beaker, color: 'text-yellow-600', bgColor: 'bg-yellow-950/40', borderColor: 'border-yellow-900/50', label: 'Corrosão', type: 'badge' },
    '#amaldiçoado': { icon: Skull, color: 'text-purple-700', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Amaldiçoado', type: 'badge' },
    '#amaldicoado': { icon: Skull, color: 'text-purple-700', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Amaldiçoado', type: 'badge' },
    '#marcado': { icon: Target, color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-900/50', label: 'Marcado', type: 'badge' },
    '#vulnerável': { icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Vulnerável', type: 'badge' },
    '#vulneravel': { icon: Target, color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-900/50', label: 'Vulnerável', type: 'badge' },
    '#rd': { icon: Shield, color: 'text-zinc-300', bgColor: 'bg-zinc-800', borderColor: 'border-zinc-600', label: 'RD', type: 'badge' },

    // --- Tipos de Dano ---
    '#fogo': { icon: Flame, color: 'text-orange-500', label: 'Fogo', type: 'hashtag' },
    '#água': { icon: Droplet, color: 'text-blue-400', label: 'Água', type: 'hashtag' },
    '#agua': { icon: Droplet, color: 'text-blue-400', label: 'Água', type: 'hashtag' },
    '#trevas': { icon: Moon, color: 'text-purple-900', label: 'Trevas', type: 'hashtag' },
    '#luz': { icon: Sun, color: 'text-amber-300', label: 'Luz', type: 'hashtag' },
    '#planta': { icon: Sprout, color: 'text-green-500', label: 'Planta', type: 'hashtag' },
    '#terra': { icon: Mountain, color: 'text-yellow-700', label: 'Terra', type: 'hashtag' },
    '#perfurante': { icon: Target, color: 'text-red-400', label: 'Perfurante', type: 'hashtag' },
    '#contusão': { icon: Shield, color: 'text-zinc-300', label: 'Contusão', type: 'hashtag' },
    '#contusao': { icon: Shield, color: 'text-zinc-300', label: 'Contusão', type: 'hashtag' },
    '#gelo': { icon: Droplets, color: 'text-cyan-300', label: 'Gelo', type: 'hashtag' },
    '#raio': { icon: Sparkles, color: 'text-yellow-300', label: 'Raio', type: 'hashtag' },
    '#ácido': { icon: Beaker, color: 'text-lime-400', label: 'Ácido', type: 'hashtag' },
    '#acido': { icon: Beaker, color: 'text-lime-400', label: 'Ácido', type: 'hashtag' },
    '#sonoro': { icon: Volume2, color: 'text-cyan-500', label: 'Sonoro', type: 'hashtag' },
    '#mental': { icon: Brain, color: 'text-pink-400', label: 'Mental', type: 'hashtag' },
    '#explosão': { icon: Bomb, color: 'text-red-500', label: 'Explosão', type: 'hashtag' },
    '#explosao': { icon: Bomb, color: 'text-red-500', label: 'Explosão', type: 'hashtag' },
    '#balístico': { icon: Crosshair, color: 'text-zinc-500', label: 'Balístico', type: 'hashtag' },
    '#balistico': { icon: Crosshair, color: 'text-zinc-500', label: 'Balístico', type: 'hashtag' },
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
