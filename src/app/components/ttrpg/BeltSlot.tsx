import { LucideIcon, X, Plus } from 'lucide-react';

interface BeltSlotProps {
  itemName?: string;
  icon?: LucideIcon;
  description?: string;
  onItemNameChange?: (value: string) => void;
  onClear?: () => void;
  onAddClick?: () => void;
}

export function BeltSlot({ itemName, icon: Icon, description, onItemNameChange, onClear, onAddClick }: BeltSlotProps) {
  const isEmpty = !itemName;

  return (
    <div className={`relative ${
      isEmpty
        ? 'bg-zinc-900/40 border-2 border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
        : 'bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-800/50 shadow-lg'
    } rounded-lg p-3 transition-all aspect-square flex flex-col items-center justify-center group`}
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

      {isEmpty ? (
        <div className="flex flex-col items-center gap-1">
          <Plus className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" />
          <span className="text-zinc-600 text-xs group-hover:text-amber-600 transition-colors">Adicionar</span>
        </div>
      ) : (
        <>
          {Icon && (
            <Icon className="w-8 h-8 text-amber-600 mb-2" />
          )}
          <input
            type="text"
            value={itemName}
            onChange={(e) => {
              e.stopPropagation();
              onItemNameChange?.(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-amber-300 text-xs text-center focus:outline-none"
          />

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
