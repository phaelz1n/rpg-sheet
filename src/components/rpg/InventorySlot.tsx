import { LucideIcon, X, Plus, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';

interface InventorySlotProps {
  itemName?: string;
  quantity?: number;
  icon?: LucideIcon;
  description?: string;
  particles?: string;
  rarity?: string;
  onQuantityChange?: (value: number) => void;
  onDelete?: () => void;
  onAddClick?: () => void;
}

export function InventorySlot({ itemName, quantity, icon: Icon, description, particles, rarity, onQuantityChange, onDelete, onAddClick }: InventorySlotProps) {
  const isEmpty = !itemName;

  return (
    <div className={`relative ${
      isEmpty
        ? 'bg-zinc-900/40 border border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
        : 'bg-gradient-to-br from-zinc-900/80 to-black/90 border border-amber-900/40 shadow-lg'
    } rounded-lg p-3 transition-all aspect-square flex flex-col items-center justify-center group overflow-hidden`}
    onClick={isEmpty ? onAddClick : undefined}>

      <AnimatePresence mode="wait">
        {!isEmpty ? (
          <motion.div
            key={itemName}
            initial={{ scale: 1.5, opacity: 0, filter: 'brightness(2)' }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              filter: 'brightness(1)',
              rotate: [0, -2, 2, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Delete button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="absolute top-1 left-1 w-4 h-4 bg-red-900/80 border border-red-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"
              >
                <X className="w-3 h-3 text-red-100" />
              </button>
            )}

            <ItemVFX type={particles as any} />

            {Icon && (
              <Icon className={`w-7 h-7 mb-1 ${
                rarity === 'legendary' ? 'text-amber-400' : rarity === 'rare' ? 'text-blue-400' : 'text-amber-600'
              }`} />
            )}
            <div className={`text-[10px] font-black uppercase text-center leading-tight tracking-tighter ${
              rarity === 'legendary' ? 'text-amber-300' : rarity === 'rare' ? 'text-blue-300' : 'text-zinc-300'
            }`}>
              {itemName}
            </div>

            {quantity !== undefined && quantity > 1 && (
              <div className="absolute top-1 right-1">
                <div className="w-5 h-5 bg-amber-900/80 border border-amber-600 rounded-full text-amber-100 text-[10px] flex items-center justify-center font-bold">
                  {quantity}
                </div>
              </div>
            )}

            {description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-amber-800/50 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-zinc-300 text-xs">
                  <RichDescription text={description} />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-1"
          >
            <Plus className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" />
            <div className="text-[9px] text-zinc-700 group-hover:text-amber-600 transition-colors font-black uppercase tracking-widest">Equipar</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
