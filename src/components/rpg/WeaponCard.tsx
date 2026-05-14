import { Swords, Hand, X, Plus } from 'lucide-react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';

interface WeaponCardProps {
  slot: 'main' | 'off';
  name?: string;
  damage?: string;
  bonus?: string;
  synergy?: string;
  special?: string;
  particles?: string;
  rarity?: string;
  onNameChange?: (value: string) => void;
  onDamageChange?: (value: string) => void;
  onBonusChange?: (value: string) => void;
  onClear?: () => void;
  onAddClick?: () => void;
}

export function WeaponCard({
  slot,
  name,
  damage,
  bonus,
  synergy,
  special,
  particles,
  rarity,
  onNameChange,
  onDamageChange,
  onBonusChange,
  onClear,
  onAddClick
}: WeaponCardProps) {
  const isEmpty = !name;

  return (
    <div className={`relative group overflow-hidden ${
      isEmpty
        ? 'bg-zinc-900/40 border-2 border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
        : `bg-gradient-to-br from-orange-950/40 to-zinc-900/80 border-2 shadow-xl shadow-orange-900/20 ${
            rarity === 'legendary' ? 'border-amber-600/50' : 'border-orange-900/60'
          }`
    } rounded-lg p-4 transition-all`}
    onClick={isEmpty ? onAddClick : undefined}>

      <ItemVFX type={particles as any} />

      {!isEmpty && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-2 right-2 w-5 h-5 bg-red-900/80 border border-red-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"
        >
          <X className="w-3.5 h-3.5 text-red-100" />
        </button>
      )}

      {/* Slot label */}
      <div className="flex items-center gap-2 mb-3">
        {slot === 'main' ? (
          <Swords className="w-4 h-4 text-amber-600" />
        ) : (
          <Hand className="w-4 h-4 text-amber-600" />
        )}
        <span className="text-amber-500 text-xs uppercase tracking-wider">
          {slot === 'main' ? 'Mão Direita' : 'Mão Esquerda (Livre/Magia)'}
        </span>
      </div>

      {isEmpty ? (
        <div className="py-8 flex flex-col items-center gap-2">
          <Plus className="w-8 h-8 text-zinc-600 group-hover:text-amber-600 transition-colors" />
          <div className="text-zinc-600 text-sm group-hover:text-amber-600 transition-colors">Selecionar Arma</div>
        </div>
      ) : (
        <>
          {/* Weapon name */}
          <input
            type="text"
            value={name}
            onChange={(e) => {
              e.stopPropagation();
              onNameChange?.(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-amber-300 mb-3 tracking-wide focus:outline-none border-b border-transparent focus:border-amber-600"
          />

          {/* Stats grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-black/40 border border-red-900/30 rounded p-2">
              <span className="text-xs text-zinc-400 uppercase">Dano</span>
              <span className="text-red-400 text-sm">{damage}</span>
            </div>

            <div className="flex items-center justify-between bg-black/40 border border-amber-900/30 rounded p-2">
              <span className="text-xs text-zinc-400 uppercase">Bônus</span>
              <span className="text-amber-400 text-sm">{bonus}</span>
            </div>

            {synergy && (
              <div className="bg-orange-950/40 border border-orange-800/40 rounded p-2">
                <div className="text-xs text-orange-400 uppercase mb-1">Sinergia</div>
                <div className="text-orange-300 text-xs">
                  <RichDescription text={synergy} />
                </div>
              </div>
            )}

            {special && (
              <div className="bg-purple-950/40 border border-purple-800/40 rounded p-2">
                <div className="text-xs text-purple-400 uppercase mb-1">Efeito Especial</div>
                <div className="text-purple-300 text-xs">
                  <RichDescription text={special} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
