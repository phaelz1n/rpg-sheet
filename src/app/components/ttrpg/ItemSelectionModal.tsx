import { X, Search } from 'lucide-react';
import { useState } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
  bonus: number;
  damage: string;
  attributeType: string;
  rarity?: string;
}

interface ItemSelectionModalProps {
  isOpen: boolean;
  title: string;
  items: Item[];
  onClose: () => void;
  onSelect: (item: Item) => void;
}

export function ItemSelectionModal({ isOpen, title, items, onClose, onSelect }: ItemSelectionModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/40">
          <h3 className="text-amber-400 text-base sm:text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-red-900/80 border border-red-700 rounded flex items-center justify-center hover:bg-red-800 transition-colors"
          >
            <X className="w-4 h-4 text-red-100" />
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
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              {items.length === 0 ? 'Nenhum item disponível' : 'Nenhum item encontrado'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className={`w-full bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border-2 ${
                  item.rarity === 'rare' ? 'border-blue-900/50' :
                  item.rarity === 'legendary' ? 'border-amber-900/50' :
                  'border-zinc-800/50'
                } rounded-lg p-3 text-left hover:from-amber-900/30 hover:to-orange-900/30 transition-colors group`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-bold ${
                    item.rarity === 'rare' ? 'text-blue-400' :
                    item.rarity === 'legendary' ? 'text-amber-400' :
                    'text-amber-300'
                  } group-hover:text-amber-200`}>{item.name}</h4>
                  <div className="flex gap-2 text-[10px] uppercase tracking-tighter">
                    {item.rarity && (
                      <span className={`px-1.5 py-0.5 rounded border ${
                        item.rarity === 'rare' ? 'bg-blue-950/40 border-blue-800/50 text-blue-300' :
                        item.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-800/50 text-amber-300' :
                        'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'
                      }`}>
                        {item.rarity === 'rare' ? 'Raro' : item.rarity === 'legendary' ? 'Lendário' : 'Comum'}
                      </span>
                    )}
                    {item.damage && (
                      <span className="px-1.5 py-0.5 bg-red-950/40 border border-red-900/50 rounded text-red-400">
                        {item.damage}
                      </span>
                    )}
                    {item.bonus !== 0 && (
                      <span className="px-1.5 py-0.5 bg-zinc-950/40 border border-zinc-800/50 rounded text-zinc-300">
                        +{item.bonus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 capitalize flex items-center gap-1">
                  <div className={`w-1 h-1 rounded-full ${
                    item.rarity === 'rare' ? 'bg-blue-500' :
                    item.rarity === 'legendary' ? 'bg-amber-500' :
                    'bg-zinc-600'
                  }`} />
                  {item.attributeType}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
