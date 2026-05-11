import { LucideIcon, X, Plus } from 'lucide-react';

interface EquipmentSlotProps {
  slotName: string;
  itemName?: string;
  rarity?: string;
  icon: LucideIcon;
  description?: string;
  onItemNameChange?: (value: string) => void;
  onClear?: () => void;
  onAddClick?: () => void;
}

import { RichDescription } from './RichDescription';

export function EquipmentSlot({ slotName, itemName, rarity, icon: Icon, description, onItemNameChange, onClear, onAddClick }: EquipmentSlotProps) {
  const isEmpty = !itemName;

  const rarityColors: Record<string, string> = {
    'common': 'border-zinc-500/50',
    'rare': 'border-blue-500/50',
    'legendary': 'border-amber-500/50'
  };

  const borderClass = !isEmpty && rarity ? rarityColors[rarity.toLowerCase()] || 'border-amber-800/50' : 'border-zinc-700/40';

  return (
    <div className={`relative group ${
      isEmpty
        ? `bg-zinc-900/40 border border-dashed ${borderClass} cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60`
        : `bg-gradient-to-br from-amber-950/30 to-zinc-900/60 border ${borderClass} shadow-lg`
    } rounded-lg p-3 transition-all`}
    onClick={isEmpty ? onAddClick : undefined}>

      {!isEmpty && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-1 right-1 w-4 h-4 bg-red-900/80 border border-red-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"
        >
          <X className="w-3 h-3 text-red-100" />
        </button>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${isEmpty ? 'text-zinc-600 group-hover:text-amber-600' : 'text-amber-600'} transition-colors`} />
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{slotName}</span>
      </div>

      {isEmpty ? (
        <div className="flex items-center gap-1 text-xs text-zinc-600 group-hover:text-amber-600 transition-colors">
          <Plus className="w-3 h-3" />
          <span>Selecionar</span>
        </div>
      ) : (
        <input
          type="text"
          value={itemName}
          onChange={(e) => {
            e.stopPropagation();
            onItemNameChange?.(e.target.value);
          }}
          className="w-full bg-transparent text-sm text-amber-300 focus:outline-none"
        />
      )}

      {!isEmpty && description && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-950 border border-amber-800/50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
          <div className="text-amber-500 text-[10px] uppercase tracking-widest font-bold mb-1 border-b border-amber-900/30 pb-1 flex items-center justify-between">
            <span>{slotName}</span>
            <span className="text-zinc-500">{rarity}</span>
          </div>
          <div className="text-zinc-300 text-xs leading-relaxed">
            <RichDescription text={description} />
          </div>
        </div>
      )}
    </div>
  );
}
