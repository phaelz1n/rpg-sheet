import { Skull, Plus, Trash2 } from 'lucide-react';
import { useCharacterStore } from '../../store/characterStore';
import { RichDescription } from '../rpg/RichDescription';

export function CursesSection() {
  const { curses, updateField } = useCharacterStore();

  const addCurse = () => {
    updateField('curses', [...curses, { id: Date.now().toString(), title: 'Nova Marca', content: '' }]);
  };

  const removeCurse = (id: string) => {
    updateField('curses', curses.filter(c => c.id !== id));
  };

  const updateCurse = (index: number, field: 'title' | 'content', value: string) => {
    const newCurses = [...curses];
    newCurses[index] = { ...newCurses[index], [field]: value };
    updateField('curses', newCurses);
  };

  return (
    <section className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-red-900/40 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-red-500 uppercase tracking-wider flex items-center gap-2 text-sm sm:text-base font-bold">
          <Skull className="w-5 h-5" />
          Efeitos & Marcas
        </h2>
        <button 
          onClick={addCurse}
          className="p-1 hover:bg-red-900/20 rounded text-red-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 relative z-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {curses.length === 0 && (
          <p className="text-zinc-600 text-xs italic text-center py-4">Nenhuma maldição ativa...</p>
        )}
        {curses.map((curse, index) => (
          <div key={curse.id} className="bg-black/40 border border-red-900/20 rounded-lg p-3 group relative">
            <button 
              onClick={() => removeCurse(curse.id)}
              className="absolute top-2 right-2 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <input 
              type="text"
              value={curse.title}
              onChange={(e) => updateCurse(index, 'title', e.target.value)}
              className="bg-transparent border-none text-red-400 font-bold text-sm w-full focus:outline-none mb-1 uppercase tracking-tight"
              placeholder="Título da Marca"
            />
            <div className="relative">
              <textarea 
                value={curse.content}
                onChange={(e) => updateCurse(index, 'content', e.target.value)}
                className="bg-transparent border-none text-zinc-400 text-xs w-full focus:outline-none min-h-[100px] resize-none opacity-0 focus:opacity-100 absolute inset-0 z-10"
                placeholder="Descreva os efeitos..."
              />
              <div className="text-zinc-400 text-xs min-h-[100px] pointer-events-none pb-2">
                <RichDescription text={curse.content || "Descreva os efeitos..."} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
