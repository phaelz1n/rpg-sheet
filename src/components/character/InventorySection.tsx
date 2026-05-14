import { Sparkles, Minus, Plus, ChevronLeft, ChevronRight, Gem } from 'lucide-react';
import { InventorySlot } from '../rpg/InventorySlot';
import { EncumbranceBar } from '../rpg/EncumbranceBar';
import { useCharacterStore } from '../../store/characterStore';

const ITEMS_PER_PAGE = 8;

interface InventorySectionProps {
  inventoryPage: number;
  onPageChange: (page: number) => void;
  onOpenModal: (type: 'weapon' | 'armor' | 'consumable') => void;
}

export function InventorySection({ inventoryPage, onPageChange, onOpenModal }: InventorySectionProps) {
  const {
    inventory, inventoryCapacity,
    updateField, updateInventoryQuantity, removeFromInventory
  } = useCharacterStore();

  const totalPages = Math.ceil(inventoryCapacity / ITEMS_PER_PAGE);
  const pageItems = inventory.slice(inventoryPage * ITEMS_PER_PAGE, (inventoryPage + 1) * ITEMS_PER_PAGE);
  const totalSlotsOnThisPage = Math.min(ITEMS_PER_PAGE, inventoryCapacity - (inventoryPage * ITEMS_PER_PAGE));
  const effectiveEmptySlots = Math.max(0, totalSlotsOnThisPage - pageItems.length);

  return (
    <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base font-bold">
          <Sparkles className="w-5 h-5" />
          Mochila
          <span className="text-xs text-zinc-500 font-normal">({inventory.length}/{inventoryCapacity})</span>
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Pagination Controls */}
          {inventoryCapacity > ITEMS_PER_PAGE && (
            <div className="flex items-center gap-2 bg-black/40 border border-amber-900/20 rounded px-2 py-1">
              <button 
                onClick={() => onPageChange(Math.max(0, inventoryPage - 1))}
                disabled={inventoryPage === 0}
                className="text-amber-600 hover:text-amber-400 disabled:text-zinc-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-tighter">
                Pág {inventoryPage + 1}
              </span>
              <button 
                onClick={() => onPageChange(Math.min(totalPages - 1, inventoryPage + 1))}
                disabled={inventoryPage >= totalPages - 1}
                className="text-amber-600 hover:text-amber-400 disabled:text-zinc-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center bg-amber-900/20 border border-amber-900/40 rounded overflow-hidden">
            <button 
              onClick={() => {
                const newCap = Math.max(8, inventoryCapacity - 4);
                updateField('inventoryCapacity', newCap);
                const maxPage = Math.ceil(newCap / ITEMS_PER_PAGE) - 1;
                if (inventoryPage > maxPage) onPageChange(maxPage);
              }}
              className="px-2 py-1 text-amber-500 hover:bg-amber-900/40 transition-all border-r border-amber-900/40 disabled:text-zinc-700"
              disabled={inventoryCapacity <= 8}
              title="Diminuir espaço da mochila"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button 
              onClick={() => updateField('inventoryCapacity', Math.min(40, inventoryCapacity + 4))}
              className="flex items-center gap-1 px-3 py-1 text-[10px] text-amber-400 hover:bg-amber-900/40 transition-all uppercase font-bold"
              title="Aumentar espaço da mochila"
            >
              <Plus className="w-3 h-3" />
              Expandir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 min-h-[180px]">
        {pageItems.map((item) => (
          <InventorySlot
            key={item.id}
            itemName={item.name}
            quantity={item.quantity}
            icon={item.icon || Gem}
            description={item.description}
            particles={item.particles}
            rarity={item.rarity}
            onQuantityChange={(newQty) => updateInventoryQuantity(item.id, newQty)}
            onDelete={() => removeFromInventory(item.id)}
          />
        ))}
        {Array.from({ length: effectiveEmptySlots }).map((_, i) => (
          <InventorySlot
            key={`empty-${i}`}
            onAddClick={() => onOpenModal('consumable')}
          />
        ))}
      </div>
      <EncumbranceBar current={inventory.length} max={inventoryCapacity} />
    </section>
  );
}
