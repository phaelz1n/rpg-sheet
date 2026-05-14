import { Shield, Hand, Sword, Brain, Eye, Flame } from 'lucide-react';
import { useCharacterStore } from '../../store/characterStore';

function CompactSkillRow({ name, bonus, onBonusChange, color }: { 
  name: string, bonus: number, onBonusChange: (v: number) => void, color: string 
}) {
  const iconColors = {
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500'
  };

  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800/50 last:border-0 group">
      <span className={`text-[11px] sm:text-xs uppercase tracking-wider font-medium ${iconColors[color as keyof typeof iconColors] || 'text-zinc-400'}`}>
        {name}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={bonus}
          onChange={(e) => onBonusChange(Number(e.target.value))}
          className="w-10 bg-transparent border-none text-right text-amber-400 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-600/30 rounded"
        />
      </div>
    </div>
  );
}

export function SkillsSection() {
  const { skills, updateSkill } = useCharacterStore();

  return (
    <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 sm:p-5">
      <h2 className="text-amber-400 uppercase tracking-wider mb-6 flex items-center gap-2 text-sm sm:text-base font-bold">
        <Shield className="w-5 h-5" />
        Perícias
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Destreza */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-emerald-900/30 pb-1 flex items-center gap-2">
            <Hand className="w-3 h-3" /> Destreza
          </h3>
          <CompactSkillRow name="Acrobacia" bonus={skills.acrobacia} color="emerald" onBonusChange={(v) => updateSkill('acrobacia', v)} />
          <CompactSkillRow name="Furtividade" bonus={skills.furtividade} color="emerald" onBonusChange={(v) => updateSkill('furtividade', v)} />
          <CompactSkillRow name="Pontaria" bonus={skills.pontaria} color="emerald" onBonusChange={(v) => updateSkill('pontaria', v)} />
        </div>

        {/* Força / Corpo */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-orange-900/30 pb-1 flex items-center gap-2">
            <Sword className="w-3 h-3" /> Corpo
          </h3>
          <CompactSkillRow name="Atletismo" bonus={skills.atletismo} color="orange" onBonusChange={(v) => updateSkill('atletismo', v)} />
          <CompactSkillRow name="Intimidação" bonus={skills.intimidacao} color="orange" onBonusChange={(v) => updateSkill('intimidacao', v)} />
        </div>

        {/* Vontade / Mente */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-blue-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-blue-900/30 pb-1 flex items-center gap-2">
            <Brain className="w-3 h-3" /> Mente
          </h3>
          <CompactSkillRow name="Percepção" bonus={skills.percepcao} color="blue" onBonusChange={(v) => updateSkill('percepcao', v)} />
          <CompactSkillRow name="Sobrevivência" bonus={skills.sobrevivencia} color="blue" onBonusChange={(v) => updateSkill('sobrevivencia', v)} />
          <CompactSkillRow name="Medicina" bonus={skills.medicina} color="blue" onBonusChange={(v) => updateSkill('medicina', v)} />
        </div>

        {/* Ocultismo / Paranormal */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-purple-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-purple-900/30 pb-1 flex items-center gap-2">
            <Eye className="w-3 h-3" /> Paranormal
          </h3>
          <CompactSkillRow name="Corrupção" bonus={skills.corrupcao} color="purple" onBonusChange={(v) => updateSkill('corrupcao', v)} />
        </div>

        {/* Fé / Espírito */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-amber-900/30 pb-1 flex items-center gap-2">
            <Flame className="w-3 h-3" /> Espírito
          </h3>
          <CompactSkillRow name="Presença" bonus={skills.presenca} color="amber" onBonusChange={(v) => updateSkill('presenca', v)} />
        </div>
      </div>
    </section>
  );
}
