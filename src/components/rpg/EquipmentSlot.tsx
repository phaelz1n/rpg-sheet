import React, { useEffect } from 'react';
import { LucideIcon, X, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';
import { audioService } from '../../lib/audio-service';

interface EquipmentSlotProps {
  slotName: string;
  itemName?: string;
  rarity?: string;
  icon: LucideIcon;
  description?: string;
  particles?: string;
  onItemNameChange?: (value: string) => void;
  onClear?: () => void;
  onAddClick?: () => void;
  onImpact?: () => void;
}

export function EquipmentSlot({ 
  slotName, 
  itemName, 
  rarity, 
  icon: Icon, 
  description, 
  particles, 
  onItemNameChange, 
  onClear, 
  onAddClick,
  onImpact 
}: EquipmentSlotProps) {
  const isEmpty = !itemName;

  useEffect(() => {
    if (!isEmpty && onImpact) {
      onImpact();
      if (rarity?.toLowerCase() === 'legendary') {
        audioService.playSound('EQUIP_LEGENDARY');
      } else {
        audioService.playSound('EQUIP_NORMAL');
      }
    }
  }, [itemName, onImpact, rarity]);

  const rarityColors: Record<string, string> = {
    'common': 'border-zinc-500/50',
    'rare': 'border-blue-500/50',
    'legendary': 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
  };

  const borderClass = !isEmpty && rarity ? rarityColors[rarity.toLowerCase()] || 'border-amber-800/50' : 'border-zinc-700/40';

  return (
    <div className={`relative group ${
      isEmpty
        ? `bg-zinc-900/40 border border-dashed ${borderClass} cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60`
        : `bg-gradient-to-br from-amber-950/30 to-zinc-900/60 border ${borderClass} shadow-lg`
    } rounded-lg p-3 transition-all duration-500`}
    onClick={isEmpty ? onAddClick : undefined}>

      <AnimatePresence mode="wait">
        {!isEmpty ? (
          <motion.div
            key={itemName}
            initial={{ scale: 2, opacity: 0, filter: 'brightness(3) blur(10px)' }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              filter: 'brightness(1) blur(0px)',
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 2, -2, 1, -1, 0]
            }}
            exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 20,
              duration: 0.5 
            }}
            className="w-full h-full relative"
          >
            {/* Hearthstone Impact Glow */}
            {rarity === 'legendary' && (
              <motion.div 
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-amber-500/40 blur-2xl rounded-full pointer-events-none z-0"
              />
            )}
            
            <ItemVFX type={particles as any} rarity={rarity} />

            {!isEmpty && onClear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-950 border border-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-30 shadow-lg"
              >
                <X className="w-3 h-3 text-red-100" />
              </button>
            )}

            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Icon className={`w-4 h-4 ${isEmpty ? 'text-zinc-600' : 'text-amber-600'} transition-colors`} />
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{slotName}</span>
              {rarity === 'legendary' && <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />}
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                value={itemName}
                onChange={(e) => {
                  e.stopPropagation();
                  onItemNameChange?.(e.target.value);
                }}
                className={`w-full bg-transparent text-sm font-black uppercase tracking-tight focus:outline-none ${
                  rarity === 'legendary' ? 'text-amber-400' : rarity === 'rare' ? 'text-blue-400' : 'text-zinc-200'
                }`}
              />
              <div className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter mt-0.5">
                {rarity || 'Comum'}
              </div>
            </div>

            {description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-950 border border-amber-800/50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
                <div className="text-amber-500 text-[10px] uppercase tracking-widest font-bold mb-1 border-b border-amber-900/30 pb-1 flex items-center justify-between">
                  <span>{slotName}</span>
                  <span className="text-zinc-500">{rarity === 'rare' ? 'Raro' : rarity === 'legendary' ? 'Lendário' : 'Comum'}</span>
                </div>
                <div className="text-zinc-300 text-xs leading-relaxed">
                  <RichDescription text={description} />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-zinc-600 group-hover:text-amber-600 transition-colors" />
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{slotName}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 group-hover:text-amber-600 transition-colors font-bold uppercase tracking-widest">
              <Plus className="w-3 h-3" />
              <span>Equipar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
