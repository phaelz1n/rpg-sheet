import { Shield, Hand, Sword, Brain, Eye, Flame } from 'lucide-react';
import { useCharacterStore } from '../../store/characterStore';

function CompactSkillRow({ name, bonus, onBonusChange, color, description }: { 
  name: string, bonus: number, onBonusChange: (v: number) => void, color: string, description?: string
}) {
  const iconColors = {
    emerald: 'text-emerald-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500'
  };

  return (
    <div className={`flex items-center justify-between py-1 border-b border-zinc-800/50 last:border-0 group relative transition-all duration-300 ${
      bonus === 0 ? 'opacity-30 hover:opacity-100' : 'opacity-100'
    }`}>
      <div className="flex items-center gap-1.5 min-w-0">
        {bonus > 0 && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' :
            color === 'orange' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse' :
            color === 'blue' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse' :
            color === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse' :
            'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'
          }`} />
        )}
        <span className={`text-[11px] sm:text-xs uppercase tracking-wider font-medium cursor-help transition-colors truncate ${
          bonus === 0 
            ? 'text-zinc-600' 
            : (iconColors[color as keyof typeof iconColors] || 'text-zinc-200 font-bold')
        }`}>
          {name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={bonus}
          onChange={(e) => onBonusChange(Number(e.target.value))}
          className={`w-10 bg-transparent border-none text-right font-bold text-xs focus:outline-none focus:ring-1 focus:ring-amber-600/30 rounded transition-colors ${
            bonus === 0 ? 'text-zinc-600' : 'text-amber-400'
          }`}
        />
      </div>

      {description && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-950 border border-zinc-800 rounded p-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom-left">
          <div className={`text-[9px] uppercase tracking-widest font-bold mb-1 border-b border-zinc-800 pb-1 ${
            bonus === 0 ? 'text-zinc-500' : (iconColors[color as keyof typeof iconColors] || 'text-zinc-400')
          }`}>
            {name}
          </div>
          <p className="text-zinc-400 text-[10px] leading-tight">
            {description}
          </p>
        </div>
      )}
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
          <CompactSkillRow name="Acrobacia" bonus={skills.acrobacia} color="emerald" description="Usada para manobras ágeis, equilíbrio e reduzir dano de queda." onBonusChange={(v) => updateSkill('acrobacia', v)} />
          <CompactSkillRow name="Furtividade" bonus={skills.furtividade} color="emerald" description="Capacidade de se mover sem ser visto ou ouvido." onBonusChange={(v) => updateSkill('furtividade', v)} />
          <CompactSkillRow name="Pontaria" bonus={skills.pontaria} color="emerald" description="Ataques à distância com arcos, bestas ou armas de arremesso." onBonusChange={(v) => updateSkill('pontaria', v)} />
        </div>

        {/* Força / Corpo */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-orange-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-orange-900/30 pb-1 flex items-center gap-2">
            <Sword className="w-3 h-3" /> Corpo
          </h3>
          <CompactSkillRow name="Atletismo" bonus={skills.atletismo} color="orange" description="Escalar, correr, saltar e outras proezas de esforço físico." onBonusChange={(v) => updateSkill('atletismo', v)} />
          <CompactSkillRow name="Intimidação" bonus={skills.intimidacao} color="orange" description="Infundir medo em outros através de força ou presença ameaçadora." onBonusChange={(v) => updateSkill('intimidacao', v)} />
        </div>

        {/* Vontade / Mente */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-blue-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-blue-900/30 pb-1 flex items-center gap-2">
            <Brain className="w-3 h-3" /> Mente
          </h3>
          <CompactSkillRow name="Percepção" bonus={skills.percepcao} color="blue" description="Capacidade de notar detalhes, sons e intenções ocultas." onBonusChange={(v) => updateSkill('percepcao', v)} />
          <CompactSkillRow name="Sobrevivência" bonus={skills.sobrevivencia} color="blue" description="Rastrear, caçar e se orientar em ambientes selvagens." onBonusChange={(v) => updateSkill('sobrevivencia', v)} />
          <CompactSkillRow name="Medicina" bonus={skills.medicina} color="blue" description="Tratamento de ferimentos, doenças e venenos." onBonusChange={(v) => updateSkill('medicina', v)} />
        </div>

        {/* Ocultismo / Paranormal */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-purple-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-purple-900/30 pb-1 flex items-center gap-2">
            <Eye className="w-3 h-3" /> Paranormal
          </h3>
          <CompactSkillRow name="Corrupção" bonus={skills.corrupcao} color="purple" description="Conhecimento sobre o abismo e resistência ao apodrecimento da alma." onBonusChange={(v) => updateSkill('corrupcao', v)} />
        </div>

        {/* Fé / Espírito */}
        <div className="space-y-1">
          <h3 className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-black mb-2 border-b border-amber-900/30 pb-1 flex items-center gap-2">
            <Flame className="w-3 h-3" /> Espírito
          </h3>
          <CompactSkillRow name="Presença" bonus={skills.presenca} color="amber" description="Influência social, diplomacia e a força do seu espírito sobre outros." onBonusChange={(v) => updateSkill('presenca', v)} />
        </div>
      </div>
    </section>
  );
}
