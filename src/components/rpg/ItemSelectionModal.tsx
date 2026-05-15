import { X, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { RPGItem } from '../../types/rpg';

interface ItemSelectionModalProps {
  isOpen: boolean;
  title: string;
  items: RPGItem[];
  onClose: () => void;
  onSelect: (item: RPGItem) => void;
}

export function ItemSelectionModal({ isOpen, title, items, onClose, onSelect }: ItemSelectionModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/40">
          <h3 className="text-amber-400 text-base sm:text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-900/20 hover:bg-red-900/40 border border-red-900/40 rounded-full flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-red-500 group-hover:text-red-200" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar item..."
              className="w-full bg-black/40 border border-amber-900/40 rounded-lg pl-10 pr-4 py-2 text-zinc-300 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 italic">
              {items.length === 0 ? 'Nenhum item disponível nesta categoria' : 'Nenhum item encontrado'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border-2 ${
                  item.rarity === 'divine' ? 'border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.2)]' :
                  item.rarity === 'legendary' ? 'border-amber-600/40 shadow-[0_0_10px_rgba(217,119,6,0.1)]' :
                  item.rarity === 'rare' ? 'border-blue-600/40' :
                  'border-zinc-800/60'
                } rounded-xl p-4 text-left hover:border-amber-500/60 hover:from-zinc-800/80 transition-all group relative overflow-hidden`}
              >
                {/* Background Glow for high rarities */}
                {item.rarity === 'divine' && <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />}
                {item.rarity === 'legendary' && <div className="absolute inset-0 bg-amber-600/5 pointer-events-none" />}

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded bg-black/40 border border-amber-900/20 flex items-center justify-center overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-zinc-700 font-bold text-[8px] uppercase tracking-tighter">N/A</div>
                      )}
                    </div>
                    <h4 className={`font-black text-sm sm:text-base uppercase tracking-tight ${
                      item.rarity === 'divine' ? 'text-red-500' :
                      item.rarity === 'legendary' ? 'text-amber-400' :
                      item.rarity === 'rare' ? 'text-blue-400' :
                      'text-zinc-200'
                    } group-hover:text-white transition-colors`}>{item.name}</h4>
                  </div>
                  
                  <div className="flex gap-1.5 text-[9px] uppercase font-black tracking-widest">
                    <span className={`px-2 py-0.5 rounded-md border ${
                      item.rarity === 'divine' ? 'bg-red-950/60 border-red-700/60 text-red-400' :
                      item.rarity === 'legendary' ? 'bg-amber-950/60 border-amber-700/60 text-amber-400' :
                      item.rarity === 'rare' ? 'bg-blue-950/60 border-blue-700/60 text-blue-400' :
                      'bg-zinc-900/80 border-zinc-700/60 text-zinc-500'
                    }`}>
                      {item.rarity === 'divine' ? 'Divino' : 
                       item.rarity === 'legendary' ? 'Lendário' : 
                       item.rarity === 'rare' ? 'Raro' : 'Comum'}
                    </span>
                    {item.damage && (
                      <span className="px-2 py-0.5 bg-red-950/30 border border-red-900/40 rounded-md text-red-500/80">
                        {item.damage}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  {item.category === 'weapon' && (
                    <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-zinc-800/40">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.rarity === 'divine' ? 'bg-red-500 animate-pulse' :
                        item.rarity === 'legendary' ? 'bg-amber-500' :
                        item.rarity === 'rare' ? 'bg-blue-500' :
                        'bg-zinc-600'
                      }`} />
                      {item.attributeType === 'dexterity' ? 'Destreza' :
                       item.attributeType === 'strength' ? 'Força' :
                       item.attributeType === 'occultism' ? 'Ocultismo' :
                       item.attributeType === 'faith' ? 'Fé' : item.attributeType}
                    </div>
                  )}

                  {item.bonus !== 0 && (
                    <div className="text-[10px] text-zinc-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-zinc-800/40">
                      Bônus: <span className="text-amber-500">+{item.bonus}</span>
                    </div>
                  )}

                  {item.category === 'material' && (
                    <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">
                      Material
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="mt-2 text-[10px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors italic">
                    {item.description.replace(/#\w+/g, '').substring(0, 60)}...
                  </p>
                )}
              </button>
            ))
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg p-3 text-zinc-500 hover:text-zinc-300 font-bold uppercase text-xs tracking-widest transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
