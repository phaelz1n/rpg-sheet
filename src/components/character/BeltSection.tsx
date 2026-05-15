import { GripHorizontal } from 'lucide-react';
import { BeltSlot } from '../rpg/BeltSlot';
import { useCharacterStore } from '../../store/characterStore';
import { useGlobalStore } from '../../store/globalStore';

interface BeltSectionProps {
  onOpenModal: (type: 'weapon' | 'armor' | 'consumable', slot: string) => void;
}

export function BeltSection({ onOpenModal }: BeltSectionProps) {
  const {
    equipmentBelt, beltSlot1, beltSlot2, beltSlot3, beltSlot4, beltSlot5, beltSlot6, beltSlot7, beltSlot8,
    updateBeltSlot
  } = useCharacterStore();
  const { rpgItems } = useGlobalStore();

  const getItemData = (idOrName: string) => {
    if (!idOrName) return null;
    return rpgItems.find(i => i.id === idOrName) || 
           rpgItems.find(i => i.name.toLowerCase() === idOrName.toLowerCase());
  };

  const getItemName = (idOrName: any) => {
    if (!idOrName || typeof idOrName === 'object') return '';
    return getItemData(idOrName)?.name || String(idOrName);
  };
  const getItemRarity = (idOrName: string) => getItemData(idOrName)?.rarity;
  const getItemImageUrl = (idOrName: string) => getItemData(idOrName)?.imageUrl;

  const beltItem = rpgItems.find(i => (i.id === equipmentBelt || i.name.toLowerCase() === equipmentBelt.toLowerCase()) && i.beltCapacity && i.beltCapacity > 0);
  const capacity = beltItem?.beltCapacity ?? 0;

  return (
    <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
      <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base font-bold">
        <GripHorizontal className="w-5 h-5" />
        Cinto & Acesso Rápido
        {capacity > 0 && (
          <span className="text-xs text-zinc-500 ml-1">({capacity} slots)</span>
        )}
      </h2>
      
      {capacity === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-lg">
          <GripHorizontal className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm italic">Equipe um Cinto no slot de Equipamento para liberar slots de acesso rápido.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: beltSlot1, key: '1' },
            { val: beltSlot2, key: '2' },
            { val: beltSlot3, key: '3' },
            { val: beltSlot4, key: '4' },
            { val: beltSlot5, key: '5' },
            { val: beltSlot6, key: '6' },
            { val: beltSlot7, key: '7' },
            { val: beltSlot8, key: '8' },
          ].slice(0, capacity).map(slot => (
            <BeltSlot
              key={slot.key}
              itemName={getItemName(slot.val)}
              rarity={getItemRarity(slot.val)}
              imageUrl={getItemImageUrl(slot.val)}
              onClear={() => updateBeltSlot(slot.key, '')}
              onAddClick={() => onOpenModal('consumable', `belt${slot.key}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
