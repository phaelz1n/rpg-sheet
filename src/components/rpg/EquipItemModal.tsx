import { X } from 'lucide-react';

interface EquipItemModalProps {
  isOpen: boolean;
  itemName: string;
  itemCategory: 'weapon' | 'armor' | 'consumable';
  onClose: () => void;
  onSelectSlot: (slot: string) => void;
}

export function EquipItemModal({ isOpen, itemName, itemCategory, onClose, onSelectSlot }: EquipItemModalProps) {
  if (!isOpen) return null;

  const weaponSlots = [
    { id: 'main', label: 'Mão Direita' },
    { id: 'off', label: 'Mão Esquerda' }
  ];

  const armorSlots = [
    { id: 'head', label: 'Cabeça' },
    { id: 'neck', label: 'Pescoço' },
    { id: 'chest', label: 'Peito' },
    { id: 'gloves', label: 'Luvas' },
    { id: 'belt', label: 'Cinto' },
    { id: 'pants', label: 'Calças' },
    { id: 'boots', label: 'Botas' }
  ];

  const slots = itemCategory === 'weapon' ? weaponSlots : armorSlots;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 max-w-md w-full shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/40">
          <h3 className="text-amber-400 text-lg">Equipar: {itemName}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-red-900/80 border border-red-700 rounded flex items-center justify-center hover:bg-red-800 transition-colors"
          >
            <X className="w-4 h-4 text-red-100" />
          </button>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4">
          Escolha onde deseja equipar este item:
        </p>

        {/* Slots */}
        <div className="space-y-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                onSelectSlot(slot.id);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-800/50 rounded-lg p-3 text-amber-300 hover:from-amber-900/40 hover:to-orange-900/40 transition-colors text-left"
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
