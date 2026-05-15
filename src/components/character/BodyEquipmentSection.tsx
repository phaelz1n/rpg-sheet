import { Shirt, Crown, Circle, Hand, GripHorizontal, CircleDot, Footprints } from 'lucide-react';
import { EquipmentSlot } from '../rpg/EquipmentSlot';
import { useCharacterStore } from '../../store/characterStore';
import { useGlobalStore } from '../../store/globalStore';

interface BodyEquipmentSectionProps {
  onOpenModal: (type: 'weapon' | 'armor' | 'consumable', slot: string) => void;
  onImpact?: () => void;
}

export function BodyEquipmentSection({ onOpenModal, onImpact }: BodyEquipmentSectionProps) {
  const {
    equipmentHead, equipmentNeck, equipmentChest, equipmentGloves, equipmentBelt, equipmentPants, equipmentBoots,
    updateField
  } = useCharacterStore();
  const { rpgItems } = useGlobalStore();

  const getItemRarity = (itemName: string) => rpgItems.find(i => i.name.toLowerCase() === itemName.toLowerCase())?.rarity;
  const getItemDescription = (itemName: string) => rpgItems.find(i => i.name.toLowerCase() === itemName.toLowerCase())?.description;
  const getItemParticles = (itemName: string) => rpgItems.find(i => i.name.toLowerCase() === itemName.toLowerCase())?.particles;
  const getItemImageUrl = (itemName: string) => rpgItems.find(i => i.name.toLowerCase() === itemName.toLowerCase())?.imageUrl;

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
          imageUrl={getItemImageUrl(equipmentHead)}
          icon={Crown}
          onClear={() => updateField('equipmentHead', '')}
          onAddClick={() => onOpenModal('armor', 'head')}
          onImpact={onImpact}
        />
        <EquipmentSlot
          slotName="Pescoço"
          itemName={equipmentNeck}
          rarity={getItemRarity(equipmentNeck)}
          description={getItemDescription(equipmentNeck)}
          particles={getItemParticles(equipmentNeck)}
          imageUrl={getItemImageUrl(equipmentNeck)}
          icon={Circle}
          onClear={() => updateField('equipmentNeck', '')}
          onAddClick={() => onOpenModal('armor', 'neck')}
          onImpact={onImpact}
        />
        <EquipmentSlot
          slotName="Peito"
          itemName={equipmentChest}
          rarity={getItemRarity(equipmentChest)}
          description={getItemDescription(equipmentChest)}
          particles={getItemParticles(equipmentChest)}
          imageUrl={getItemImageUrl(equipmentChest)}
          icon={Shirt}
          onClear={() => updateField('equipmentChest', '')}
          onAddClick={() => onOpenModal('armor', 'chest')}
          onImpact={onImpact}
        />
        <EquipmentSlot
          slotName="Luvas"
          itemName={equipmentGloves}
          rarity={getItemRarity(equipmentGloves)}
          description={getItemDescription(equipmentGloves)}
          particles={getItemParticles(equipmentGloves)}
          imageUrl={getItemImageUrl(equipmentGloves)}
          icon={Hand}
          onClear={() => updateField('equipmentGloves', '')}
          onAddClick={() => onOpenModal('armor', 'gloves')}
          onImpact={onImpact}
        />
        <EquipmentSlot
          slotName="Cinto"
          itemName={equipmentBelt}
          rarity={getItemRarity(equipmentBelt)}
          description={getItemDescription(equipmentBelt)}
          particles={getItemParticles(equipmentBelt)}
          imageUrl={getItemImageUrl(equipmentBelt)}
          icon={GripHorizontal}
          onClear={() => updateField('equipmentBelt', '')}
          onAddClick={() => onOpenModal('armor', 'belt')}
          onImpact={onImpact}
        />
        <EquipmentSlot
          slotName="Calças"
          itemName={equipmentPants}
          rarity={getItemRarity(equipmentPants)}
          description={getItemDescription(equipmentPants)}
          particles={getItemParticles(equipmentPants)}
          imageUrl={getItemImageUrl(equipmentPants)}
          icon={CircleDot}
          onClear={() => updateField('equipmentPants', '')}
          onAddClick={() => onOpenModal('armor', 'pants')}
          onImpact={onImpact}
        />
        <div className="col-span-2">
          <EquipmentSlot
            slotName="Botas"
            itemName={equipmentBoots}
            rarity={getItemRarity(equipmentBoots)}
            description={getItemDescription(equipmentBoots)}
            particles={getItemParticles(equipmentBoots)}
            imageUrl={getItemImageUrl(equipmentBoots)}
            icon={Footprints}
            onClear={() => updateField('equipmentBoots', '')}
            onAddClick={() => onOpenModal('armor', 'boots')}
            onImpact={onImpact}
          />
        </div>
      </div>
    </section>
  );
}
