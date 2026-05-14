import { Target, Plus } from 'lucide-react';
import { AbilityCard } from '../rpg/AbilityCard';
import { useCharacterStore } from '../../store/characterStore';
import { Zap } from 'lucide-react';

export function CombatAbilitiesSection() {
  const {
    abilities,
    addAbility: storeAddAbility,
    updateAbility,
    removeAbility
  } = useCharacterStore();

  const handleAddAbility = () => {
    if (abilities.length >= 4) return;
    storeAddAbility({
      id: Date.now().toString(),
      name: 'Nova Habilidade',
      type: 'action',
      icon: Zap,
      effect: ''
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-amber-400 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base font-bold">
          <Target className="w-5 h-5" />
          Habilidades de Combate
        </h2>
        {abilities.length < 4 && (
          <button 
            onClick={handleAddAbility}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-900/20 border border-amber-800/40 rounded-lg text-amber-500 text-xs hover:bg-amber-900/40 transition-all font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {abilities.length === 0 && (
          <div className="py-8 text-center border-2 border-dashed border-zinc-800 rounded-xl">
            <Target className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm italic text-center px-4">
              Você ainda não possui habilidades de combate. Clique em "Adicionar" para criar uma.
            </p>
          </div>
        )}
        {abilities.map(ability => (
          <AbilityCard
            key={ability.id}
            {...ability}
            onNameChange={(value) => updateAbility(ability.id, 'name', value)}
            onTypeChange={(value) => updateAbility(ability.id, 'type', value)}
            onManaCostChange={(value) => updateAbility(ability.id, 'manaCost', value)}
            onCorruptionCostChange={(value) => updateAbility(ability.id, 'corruptionCost', value)}
            onStaminaCostChange={(value) => updateAbility(ability.id, 'staminaCost', value)}
            onTestChange={(value) => updateAbility(ability.id, 'test', value)}
            onDamageChange={(value) => updateAbility(ability.id, 'damage', value)}
            onEffectChange={(value) => updateAbility(ability.id, 'effect', value)}
            onBacklashChange={(value) => updateAbility(ability.id, 'backlash', value)}
            onDelete={() => removeAbility(ability.id)}
          />
        ))}
      </div>
    </section>
  );
}
