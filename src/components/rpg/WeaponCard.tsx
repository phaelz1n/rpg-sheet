import React, { useEffect } from 'react';
import { Swords, Hand, X, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';
import { audioService } from '../../lib/audio-service';
import { useSelectedItem } from '../../context/SelectedItemContext';
import { useCharacterStore } from '../../store/characterStore';
import { DivineEquipEffect } from './DivineEquipEffect';

interface WeaponCardProps {
  slot: 'main' | 'off';
  name?: string;
  damage?: string;
  bonus?: string;
  synergy?: string;
  special?: string;
  particles?: string;
  rarity?: string;
  imageUrl?: string;
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
  imageUrl,
  onClear,
  onAddClick,
  onImpact
}: WeaponCardProps) {
  const isEmpty = !name;
  const { setSelected } = useSelectedItem();

  const handleSelect = () => {
    if (!isEmpty) {
      setSelected({
        id: '',
        name: String(name || ''),
        type: 'weapon',
        rarity: rarity as any,
        description: String(special || ''),
        particles: particles as any,
      } as any);
    }
  };

  const isInitialMount = React.useRef(true);
  const lastNameRef = React.useRef(name);
  const lastActionSource = useCharacterStore(s => s.lastActionSource);

  // Stores the new name when it arrives before rarity is resolved
  const pendingNameRef = React.useRef<string | null>(null);
  const [isDivineEquipping, setIsDivineEquipping] = React.useState(false);
  // Controls whether the divine item is visible in the card (hidden during the cinematic)
  const [isDivineRevealed, setIsDivineRevealed] = React.useState(
    () => rarity?.toLowerCase() === 'divine' ? true : false
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastNameRef.current = name;
      return;
    }

    const nameChanged = !isEmpty && name !== lastNameRef.current;

    if (nameChanged) {
      if (rarity === undefined) {
        // rarity not resolved yet — park the name and wait
        pendingNameRef.current = name;
        lastNameRef.current = name;
        return;
      }
      // Process: name changed and rarity is already known
      lastNameRef.current = name;
      pendingNameRef.current = null;
      
      // ONLY trigger effect if it's a local user action
      if (lastActionSource === 'local') {
        triggerEquipEffect(rarity);
      }
      return;
    }

    // Name didn't change, but check if rarity just resolved for a parked name
    if (pendingNameRef.current !== null && rarity !== undefined) {
      pendingNameRef.current = null;
      if (lastActionSource === 'local') {
        triggerEquipEffect(rarity);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, rarity, isEmpty]);

  function triggerEquipEffect(resolvedRarity: string | undefined) {
    if (resolvedRarity?.toLowerCase() === 'divine') {
      setIsDivineRevealed(false);
      setIsDivineEquipping(true);
      setTimeout(() => {
        setIsDivineEquipping(false);
        audioService.playSound('EQUIP_LEGENDARY');
        setIsDivineRevealed(true);
        if (onImpact) onImpact();
      }, 2500);
    } else if (resolvedRarity?.toLowerCase() === 'legendary') {
      if (onImpact) onImpact();
      audioService.playSound('EQUIP_LEGENDARY');
    } else {
      audioService.playSound('EQUIP_NORMAL');
    }
  }

  // For divine items: treat card as empty while the cinematic is playing
  const showAsEmpty = isEmpty || (rarity?.toLowerCase() === 'divine' && isDivineEquipping && !isDivineRevealed);

  return (
    <>
      {/* Divine Equip Animation Overlay */}
      <DivineEquipEffect 
        name={name || ''} 
        icon={slot === 'main' ? Swords : Hand} 
        particles={particles} 
        isVisible={isDivineEquipping} 
        imageUrl={imageUrl}
      />

      <div className={`relative group ${
        showAsEmpty
          ? 'bg-zinc-900/40 border-2 border-dashed border-zinc-700/40 cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60'
          : `bg-gradient-to-br from-orange-950/40 to-zinc-900/80 border-2 shadow-xl shadow-orange-900/20 ${
              rarity?.toLowerCase() === 'divine' ? 'border-red-600/60 shadow-red-900/40 from-red-950/40' :
              rarity?.toLowerCase() === 'legendary' ? 'border-amber-600/50' : 'border-orange-900/60'
            }`
      } rounded-lg p-4 transition-all duration-500 min-h-[220px] flex flex-col`}
      onClick={showAsEmpty ? onAddClick : handleSelect}>

        <AnimatePresence mode="wait">
          {!showAsEmpty ? (
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
              {(rarity?.toLowerCase() === 'legendary' || rarity?.toLowerCase() === 'divine') && (
                <motion.div 
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute inset-0 blur-2xl rounded-full pointer-events-none z-0 ${
                    rarity?.toLowerCase() === 'divine' ? 'bg-red-600/40' : 'bg-amber-500/40'
                  }`}
                />
              )}

              <ItemVFX type={particles as any} rarity={rarity} name={name} />

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

              {/* New Side-by-Side Layout */}
              <div className="flex gap-4 flex-1">
                {/* Left Side: Weapon Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-black/40 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center group/img">
                  {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover/img:scale-105" />
                  ) : (
                    <div className="text-zinc-800 opacity-20">
                      {slot === 'main' ? <Swords className="w-12 h-12" /> : <Hand className="w-12 h-12" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Right Side: Info & Stats */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    {/* Slot label */}
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                      {slot === 'main' ? (
                        <Swords className={`w-3.5 h-3.5 ${rarity === 'divine' ? 'text-red-500' : 'text-amber-600'}`} />
                      ) : (
                        <Hand className={`w-3.5 h-3.5 ${rarity === 'divine' ? 'text-red-500' : 'text-amber-600'}`} />
                      )}
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${
                        rarity === 'divine' ? 'text-red-400' : 'text-amber-500'
                      }`}>
                        {slot === 'main' ? 'Mão Direita' : 'Mão Esquerda'}
                      </span>
                    </div>

                    {/* Weapon name */}
                    <h3 className={`w-full mb-3 tracking-tighter font-black uppercase text-base leading-tight ${
                      rarity?.toLowerCase() === 'divine' ? 'text-red-500' : rarity?.toLowerCase() === 'legendary' ? 'text-amber-400' : rarity?.toLowerCase() === 'rare' ? 'text-blue-400' : 'text-amber-100'
                    }`}>
                      {String(name || '')}
                    </h3>

                    {/* Stats horizontal grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col bg-black/40 border border-red-900/30 rounded p-1.5 px-2">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold leading-none mb-1">Dano</span>
                        <span className="text-red-400 text-sm font-black leading-none">{String(damage || '0')}</span>
                      </div>

                      <div className="flex flex-col bg-black/40 border border-amber-900/30 rounded p-1.5 px-2">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold leading-none mb-1">Bônus</span>
                        <span className="text-amber-400 text-sm font-black leading-none">{String(bonus || '0')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {synergy && (
                      <div className="bg-orange-950/20 border border-orange-800/20 rounded p-1.5 px-2">
                        <div className="text-[8px] text-orange-400 uppercase font-bold mb-0.5">Sinergia</div>
                        <div className="text-orange-200 text-[10px] leading-tight italic line-clamp-2">
                          <RichDescription text={synergy} />
                        </div>
                      </div>
                    )}

                    {special && (
                      <div className="bg-purple-950/20 border border-purple-800/20 rounded p-1.5 px-2">
                        <div className="text-[8px] text-purple-400 uppercase font-bold mb-0.5">Efeito</div>
                        <div className="text-purple-100 text-[10px] leading-tight line-clamp-2">
                          <RichDescription text={special} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Hover Tooltip for Full Description */}
            {(special || synergy) && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-zinc-950 border border-amber-900/50 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom">
                <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 border-b border-amber-900/30 pb-1 flex items-center justify-between ${
                  rarity === 'divine' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  <span>{String(name || 'Arma')}</span>
                  <span className="text-zinc-500">{slot === 'main' ? 'Mão Direita' : 'Mão Esquerda'}</span>
                </div>
                
                {synergy && (
                  <div className="mb-2">
                    <div className="text-[8px] text-orange-400 uppercase font-bold mb-1">Sinergia</div>
                    <div className="text-orange-100 text-xs leading-relaxed italic">
                      <RichDescription text={synergy} />
                    </div>
                  </div>
                )}

                {special && (
                  <div>
                    <div className="text-[8px] text-purple-400 uppercase font-bold mb-1">Efeito Especial</div>
                    <div className="text-purple-100 text-xs leading-relaxed">
                      <RichDescription text={special} />
                    </div>
                  </div>
                )}
              </div>
            )}
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
    </>
  );
}
