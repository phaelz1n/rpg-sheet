import { LucideIcon, X, Plus } from 'lucide-react';

interface BeltSlotProps {
  itemName?: string;
  rarity?: string;
  icon?: LucideIcon;
  imageUrl?: string;
  description?: string;
  onClear?: () => void;
  onAddClick?: () => void;
}

export function BeltSlot({ itemName, rarity, icon: Icon, imageUrl, description, onClear, onAddClick }: BeltSlotProps) {
  const isEmpty = !itemName;

  const rarityColors: Record<string, string> = {
    'common': 'border-zinc-500/50',
    'rare': 'border-blue-500/50',
    'legendary': 'border-amber-500/50'
  };

  const borderClass = !isEmpty && rarity ? rarityColors[rarity.toLowerCase()] || 'border-amber-800/50' : 'border-zinc-700/40';

  return (
    <div className={`relative ${
      isEmpty
        ? `bg-zinc-900/40 border-2 border-dashed ${borderClass} cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60`
        : `bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 ${borderClass} shadow-lg`
    } rounded-lg p-3 transition-all aspect-square flex flex-col items-center justify-center group overflow-hidden`}
    onClick={isEmpty ? onAddClick : undefined}>

      {!isEmpty && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-1 right-1 w-4 h-4 bg-red-950 border border-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10 shadow-lg"
        >
          <X className="w-3 h-3 text-red-100" />
        </button>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center gap-1">
          <Plus className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" />
          <span className="text-zinc-600 text-[10px] uppercase font-black tracking-widest group-hover:text-amber-600 transition-colors">Vazio</span>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 flex items-center justify-center mb-1">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-contain" />
            ) : Icon ? (
              <Icon className="w-7 h-7 text-amber-600" />
            ) : (
              <div className="text-zinc-800 opacity-20">?</div>
            )}
          </div>
          
          <div className={`w-full text-[10px] font-black uppercase text-center leading-tight tracking-tighter truncate ${
            rarity === 'legendary' ? 'text-amber-300' : rarity === 'rare' ? 'text-blue-300' : 'text-zinc-300'
          }`}>
            {itemName}
          </div>

          {description && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-950 border border-amber-800/50 rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="text-zinc-300 text-xs">{description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
