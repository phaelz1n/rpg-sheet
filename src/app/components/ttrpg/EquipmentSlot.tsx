import { LucideIcon, X, Plus } from 'lucide-react';

interface EquipmentSlotProps {
  slotName: string;
  itemName?: string;
  icon: LucideIcon;
  onItemNameChange?: (value: string) => void;
  onClear?: () => void;
  onAddClick?: () => void;
}

export function EquipmentSlot({ slotName, itemName, icon: Icon, onItemNameChange, onClear, onAddClick }: EquipmentSlotProps) {
  const isEmpty = !itemName;

  return (
    <div className={`relative group ${
      isEmpty
        ? 'bg-zinc-900/40 border border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
        : 'bg-gradient-to-br from-amber-950/30 to-zinc-900/60 border border-amber-800/50 shadow-lg'
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
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-sm text-amber-300 focus:outline-none"
        />
      )}
    </div>
  );
}
