import { Heart, Brain, Footprints, Droplet } from 'lucide-react';
import { StatusGauge } from '../rpg/StatusGauge';
import { useCharacterStore } from '../../store/characterStore';

export function StatusSection() {
  const {
    health, maxHealth, sanity, maxSanity, mana, maxMana, stamina, maxStamina,
    updateField
  } = useCharacterStore();

  return (
    <div className="flex-1 grid grid-cols-2 gap-3">
      <StatusGauge
        label="Vida"
        current={health}
        max={maxHealth}
        icon={Heart}
        color="red"
        description="Sua saúde física. Se chegar a 0, você cai inconsciente ou morre."
        onCurrentChange={(val) => updateField('health', val)}
        onMaxChange={(val) => updateField('maxHealth', val)}
      />
      <StatusGauge
        label="Sanidade"
        current={sanity}
        max={maxSanity}
        icon={Brain}
        color="purple"
        description="Sua estabilidade mental. Se chegar a 0, você sucumbe à loucura ou trauma."
        onCurrentChange={(val) => updateField('sanity', val)}
        onMaxChange={(val) => updateField('maxSanity', val)}
      />
      <StatusGauge
        label="Mana (PM)"
        current={mana}
        max={maxMana}
        icon={Droplet}
        color="blue"
        description="Pontos de Mana usados para habilidades especiais e concentração."
        onCurrentChange={(val) => updateField('mana', val)}
        onMaxChange={(val) => updateField('maxMana', val)}
      />
      <StatusGauge
        label="Estamina"
        current={stamina}
        max={maxStamina}
        icon={Footprints}
        color="emerald"
        description="Energia física para realizar ações extras, esquivas e proezas atléticas."
        onCurrentChange={(val) => updateField('stamina', val)}
        onMaxChange={(val) => updateField('maxStamina', val)}
      />
    </div>
  );
}
