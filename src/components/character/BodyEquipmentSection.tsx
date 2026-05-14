import { Shirt, Crown, Circle, Hand, GripHorizontal, CircleDot, Footprints } from 'lucide-react';
import { EquipmentSlot } from '../rpg/EquipmentSlot';
import { useCharacterStore } from '../../store/characterStore';
import { useGlobalStore } from '../../store/globalStore';

interface BodyEquipmentSectionProps {
  onOpenModal: (type: 'weapon' | 'armor' | 'consumable', slot: string) => void;
}

export function BodyEquipmentSection({ onOpenModal }: BodyEquipmentSectionProps) {
  const {
    equipmentHead, equipmentNeck, equipmentChest, equipmentGloves, equipmentBelt, equipmentPants, equipmentBoots,
    updateField
  } = useCharacterStore();
  const { rpgItems } = useGlobalStore();

  const getItemRarity = (itemName: string) => rpgItems.find(i => i.name === itemName)?.rarity;
  const getItemDescription = (itemName: string) => rpgItems.find(i => i.name === itemName)?.description;
  const getItemParticles = (itemName: string) => rpgItems.find(i => i.name === itemName)?.particles;

  return (
    <section className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-5 shadow-xl">
      <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm sm:text-base font-bold">
        <Shirt className="w-5 h-5" />
        Equipamento
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <EquipmentSlot
          slotName="Cabeça"
          itemName={equipmentHead}
          rarity={getItemRarity(equipmentHead)}
          description={getItemDescription(equipmentHead)}
          particles={getItemParticles(equipmentHead)}
          icon={Crown}
          onItemNameChange={(val) => updateField('equipmentHead', val)}
          onClear={() => updateField('equipmentHead', '')}
          onAddClick={() => onOpenModal('armor', 'head')}
        />
        <EquipmentSlot
          slotName="Pescoço"
          itemName={equipmentNeck}
          rarity={getItemRarity(equipmentNeck)}
          description={getItemDescription(equipmentNeck)}
          particles={getItemParticles(equipmentNeck)}
          icon={Circle}
          onItemNameChange={(val) => updateField('equipmentNeck', val)}
          onClear={() => updateField('equipmentNeck', '')}
          onAddClick={() => onOpenModal('armor', 'neck')}
        />
        <EquipmentSlot
          slotName="Peito"
          itemName={equipmentChest}
          rarity={getItemRarity(equipmentChest)}
          description={getItemDescription(equipmentChest)}
          particles={getItemParticles(equipmentChest)}
          icon={Shirt}
          onItemNameChange={(val) => updateField('equipmentChest', val)}
          onClear={() => updateField('equipmentChest', '')}
          onAddClick={() => onOpenModal('armor', 'chest')}
        />
        <EquipmentSlot
          slotName="Luvas"
          itemName={equipmentGloves}
          rarity={getItemRarity(equipmentGloves)}
          description={getItemDescription(equipmentGloves)}
          particles={getItemParticles(equipmentGloves)}
          icon={Hand}
          onItemNameChange={(val) => updateField('equipmentGloves', val)}
          onClear={() => updateField('equipmentGloves', '')}
          onAddClick={() => onOpenModal('armor', 'gloves')}
        />
        <EquipmentSlot
          slotName="Cinto"
          itemName={equipmentBelt}
          rarity={getItemRarity(equipmentBelt)}
          description={getItemDescription(equipmentBelt)}
          particles={getItemParticles(equipmentBelt)}
          icon={GripHorizontal}
          onItemNameChange={(val) => updateField('equipmentBelt', val)}
          onClear={() => updateField('equipmentBelt', '')}
          onAddClick={() => onOpenModal('armor', 'belt')}
        />
        <EquipmentSlot
          slotName="Calças"
          itemName={equipmentPants}
          rarity={getItemRarity(equipmentPants)}
          description={getItemDescription(equipmentPants)}
          particles={getItemParticles(equipmentPants)}
          icon={CircleDot}
          onItemNameChange={(val) => updateField('equipmentPants', val)}
          onClear={() => updateField('equipmentPants', '')}
          onAddClick={() => onOpenModal('armor', 'pants')}
        />
        <div className="col-span-2">
          <EquipmentSlot
            slotName="Botas"
            itemName={equipmentBoots}
            rarity={getItemRarity(equipmentBoots)}
            description={getItemDescription(equipmentBoots)}
            particles={getItemParticles(equipmentBoots)}
            icon={Footprints}
            onItemNameChange={(val) => updateField('equipmentBoots', val)}
            onClear={() => updateField('equipmentBoots', '')}
            onAddClick={() => onOpenModal('armor', 'boots')}
          />
        </div>
      </div>
    </section>
  );
}
