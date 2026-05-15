import { Coins, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { useCharacterStore } from '../../store/characterStore';
import { useState } from 'react';
import goldImg from '../../assets/gold.png';
import silverImg from '../../assets/silver.png';
import bronzeImg from '../../assets/bronze.png';

export function CoinPouch() {
  const { coinsBronze, addCoins, removeCoins } = useCharacterStore();
  const [amount, setAmount] = useState(1);
  const [selectedType, setSelectedType] = useState<'gold' | 'silver' | 'bronze'>('bronze');

  const gold = Math.floor(coinsBronze / 100);
  const silver = Math.floor((coinsBronze % 100) / 10);
  const bronze = coinsBronze % 10;

  const handleAdd = () => {
    let multiplier = 1;
    if (selectedType === 'gold') multiplier = 100;
    if (selectedType === 'silver') multiplier = 10;
    addCoins(amount * multiplier);
  };

  const handleRemove = () => {
    let multiplier = 1;
    if (selectedType === 'gold') multiplier = 100;
    if (selectedType === 'silver') multiplier = 10;
    removeCoins(amount * multiplier);
  };

  return (
    <div className="bg-zinc-900/60 border-2 border-amber-900/50 rounded-xl p-4 shadow-xl">
      <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2 text-sm font-bold">
        <img src={goldImg} alt="" className="w-5 h-5 object-contain" />
        Sacola de Moedas
      </h2>

      <div className="flex items-center justify-around mb-6 bg-black/40 rounded-lg p-3 border border-amber-900/20">
        {/* OURO */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
            <img src={goldImg} alt="Ouro" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black text-amber-400">{gold}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Ouro</span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        {/* PRATA */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-[0_0_8px_rgba(212,212,216,0.2)]">
            <img src={silverImg} alt="Prata" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black text-zinc-300">{silver}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Prata</span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        {/* BRONZE */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-[0_0_8px_rgba(234,88,12,0.2)]">
            <img src={bronzeImg} alt="Bronze" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black text-orange-400">{bronze}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Bronze</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-full bg-black/40 border border-amber-900/30 rounded px-3 py-1.5 text-amber-100 text-sm focus:outline-none focus:border-amber-600"
            min={1}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-zinc-800 border border-amber-900/30 rounded px-2 py-1.5 text-xs text-amber-400 focus:outline-none"
          >
            <option value="gold">Ouro</option>
            <option value="silver">Prata</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 py-2 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-800/40 rounded-lg text-emerald-400 text-xs font-bold transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            Adicionar
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center justify-center gap-2 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800/40 rounded-lg text-red-400 text-xs font-bold transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            Retirar
          </button>
        </div>
      </div>
    </div>
  );
}
