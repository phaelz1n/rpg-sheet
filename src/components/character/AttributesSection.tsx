import { Sword, Eye, Zap, Heart, Brain, Dumbbell, Droplet } from 'lucide-react';
import { HexAttributeCard } from '../rpg/HexAttributeCard';
import { useCharacterStore } from '../../store/characterStore';

export function AttributesSection() {
  const {
    occultism, dexterity, vigor, willpower, strength, faith,
    updateField
  } = useCharacterStore();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base">
          <Sword className="w-5 h-5" />
          <span className="hidden sm:inline">Atributos (2d6+Bônus)</span>
          <span className="sm:hidden">Atributos</span>
        </h2>
        <p className="text-xs text-zinc-500 italic hidden md:block">Evolução em +5 requer treinamento</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <HexAttributeCard name="Ocultismo" bonus={occultism} icon={Eye} onBonusChange={(v) => updateField('occultism', v)} />
        <HexAttributeCard name="Destreza" bonus={dexterity} icon={Zap} onBonusChange={(v) => updateField('dexterity', v)} />
        <HexAttributeCard name="Vigor" bonus={vigor} icon={Heart} onBonusChange={(v) => updateField('vigor', v)} />
        <HexAttributeCard name="Vontade" bonus={willpower} icon={Brain} onBonusChange={(v) => updateField('willpower', v)} />
        <HexAttributeCard name="Força" bonus={strength} icon={Dumbbell} onBonusChange={(v) => updateField('strength', v)} />
        <HexAttributeCard name="Fé" bonus={faith} icon={Droplet} onBonusChange={(v) => updateField('faith', v)} />
      </div>
    </section>
  );
}
