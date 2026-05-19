import { LucideIcon, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';
import { useSelectedItem } from '../../context/SelectedItemContext';

interface InventorySlotProps {
  itemName?: string;
  quantity?: number;
  icon?: LucideIcon;
  imageUrl?: string;
  description?: string;
  particles?: string;
  rarity?: string;
  onQuantityChange?: (value: number) => void;
  onDelete?: () => void;
  onAddClick?: () => void;
}

export function InventorySlot({
  itemName,
  quantity,
  icon: Icon,
  imageUrl,
  description,
  particles,
  rarity,
  onQuantityChange,
  onDelete,
  onAddClick,
}: InventorySlotProps) {
  const isEmpty = !itemName;
  const { setSelected } = useSelectedItem();

  const handleSelect = () => {
    if (!isEmpty) {
      setSelected({
        id: '',
        name: String(itemName || ''),
        type: '',
        rarity: rarity as any,
        description: String(description || ''),
        particles: particles as any,
      } as any);
    }
  };

  return (
    <div
      className={`relative ${
        isEmpty
          ? 'bg-zinc-900/40 border border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
          : 'bg-gradient-to-br from-zinc-900/80 to-black/90 border border-amber-900/40 shadow-lg'
      } rounded-lg p-3 transition-all aspect-square flex flex-col items-center justify-center group overflow-hidden`}
      onClick={isEmpty ? onAddClick : handleSelect}
    >
      <AnimatePresence mode="wait">
        {!isEmpty ? (
          <motion.div
            key={String(itemName)}
            initial={{ scale: 1.5, opacity: 0, filter: 'brightness(2)' }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: 'brightness(1)',
              rotate: [0, -2, 2, 0],
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

            <ItemVFX type={particles as any} rarity={rarity} name={String(itemName || '')} />

            <div className="relative flex-1 w-full flex items-center justify-center my-1 rounded bg-black/20 border border-white/5 group/img overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover/img:scale-110" />
              ) : Icon ? (
                <Icon className="w-6 h-6 text-amber-600 opacity-30" />
              ) : (
                <div className="text-zinc-800 opacity-20 text-xs">?</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
            
            <div className={`w-full text-[9px] font-black uppercase text-center leading-tight tracking-tighter truncate ${
              rarity === 'legendary' ? 'text-amber-300' : rarity === 'rare' ? 'text-blue-300' : 'text-zinc-300'
            }`}>
              {String(itemName || '')}
            </div>

            {quantity !== undefined && (
              <>
                <div className={`absolute top-1 right-1 z-10 ${onQuantityChange ? 'group-hover:hidden' : ''}`}>
                  {quantity > 1 && (
                    <div className="w-5 h-5 bg-amber-900/80 border border-amber-600 rounded-full text-amber-100 text-[10px] flex items-center justify-center font-bold shadow-lg">
                      {quantity}
                    </div>
                  )}
                </div>
                
                {onQuantityChange && (
                  <div className="absolute top-1 right-1 z-20 hidden group-hover:flex items-center h-6 bg-black/95 border border-amber-700/50 rounded-full shadow-2xl backdrop-blur-md">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.max(1, quantity - 1)); }}
                      className="h-full px-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-l-full flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <div className={`px-1 text-[10px] font-bold min-w-[16px] text-center ${quantity >= 5 ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {quantity}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuantityChange(Math.min(5, quantity + 1)); }}
                      className={`h-full px-2 rounded-r-full flex items-center justify-center transition-colors ${quantity >= 5 ? 'text-zinc-600 cursor-not-allowed' : 'text-amber-400 hover:text-amber-200 hover:bg-amber-900/40'}`}
                      disabled={quantity >= 5}
                    >
                      +
                    </button>
                  </div>
                )}
              </>
            )}

            {description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-amber-800/5 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="text-zinc-300 text-xs">
                  <RichDescription text={description} />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-1">
            <Plus className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" />
            <div className="text-[9px] text-zinc-700 group-hover:text-amber-600 transition-colors font-black uppercase tracking-widest">
              Equipar
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
