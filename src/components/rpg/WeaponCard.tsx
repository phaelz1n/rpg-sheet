import { Swords, Hand, X, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  onImpact?: () => void;
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
  onAddClick,
  onImpact
}: WeaponCardProps) {
  const isEmpty = !name;

  React.useEffect(() => {
    if (!isEmpty && onImpact) {
      onImpact();
    }
  }, [name, onImpact]);

  return (
    <div className={`relative group ${
      isEmpty
        ? 'bg-zinc-900/40 border-2 border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
        : `bg-gradient-to-br from-orange-950/40 to-zinc-900/80 border-2 shadow-xl shadow-orange-900/20 ${
            rarity === 'legendary' ? 'border-amber-600/50' : 'border-orange-900/60'
          }`
    } rounded-lg p-4 transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col`}
    onClick={isEmpty ? onAddClick : undefined}>

      <AnimatePresence mode="wait">
        {!isEmpty ? (
          <motion.div
            key={name}
            initial={{ scale: 2, opacity: 0, filter: 'brightness(3) blur(10px)' }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              filter: 'brightness(1) blur(0px)',
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 2, -2, 1, -1, 0]
            }}
            exit={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 20,
              duration: 0.5 
            }}
            className="flex-1 flex flex-col"
          >
            {/* Hearthstone Impact Glow */}
            {rarity === 'legendary' && (
              <motion.div 
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-amber-500/40 blur-2xl rounded-full pointer-events-none z-0"
              />
            )}

            <ItemVFX type={particles as any} />

            {!isEmpty && onClear && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-0 right-0 w-6 h-6 bg-red-950 border border-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-30 shadow-lg"
              >
                <X className="w-3.5 h-3.5 text-red-100" />
              </button>
            )}

            {/* Slot label */}
            <div className="flex items-center gap-2 mb-3 relative z-10">
              {slot === 'main' ? (
                <Swords className="w-4 h-4 text-amber-600" />
              ) : (
                <Hand className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-black">
                {slot === 'main' ? 'Mão Direita' : 'Mão Esquerda'}
              </span>
              {rarity === 'legendary' && <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />}
            </div>

            {/* Weapon name */}
            <input
              type="text"
              value={name}
              onChange={(e) => {
                e.stopPropagation();
                onNameChange?.(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full bg-transparent mb-3 tracking-tighter focus:outline-none border-b border-transparent focus:border-amber-600 font-black uppercase text-base ${
                rarity === 'legendary' ? 'text-amber-400' : rarity === 'rare' ? 'text-blue-400' : 'text-amber-100'
              }`}
            />

            {/* Stats grid */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between bg-black/40 border border-red-900/30 rounded p-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Dano</span>
                <span className="text-red-400 text-sm font-black">{damage}</span>
              </div>

              <div className="flex items-center justify-between bg-black/40 border border-amber-900/30 rounded p-2">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Bônus</span>
                <span className="text-amber-400 text-sm font-black">{bonus}</span>
              </div>

              {synergy && (
                <div className="bg-orange-950/40 border border-orange-800/40 rounded p-2">
                  <div className="text-[9px] text-orange-400 uppercase font-bold mb-1">Sinergia</div>
                  <div className="text-orange-200 text-[11px] leading-tight italic">
                    <RichDescription text={synergy} />
                  </div>
                </div>
              )}

              {special && (
                <div className="bg-purple-950/40 border border-purple-800/40 rounded p-2">
                  <div className="text-[9px] text-purple-400 uppercase font-bold mb-1">Efeito Especial</div>
                  <div className="text-purple-200 text-[11px] leading-tight">
                    <RichDescription text={special} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center group-hover:border-amber-600/50 transition-colors">
              <Plus className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="text-zinc-600 text-[10px] uppercase font-black tracking-widest group-hover:text-amber-600 transition-colors">Equipar Arma</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
