import React, { useEffect } from 'react';
import { LucideIcon, X, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';
import { DivineEquipEffect } from './DivineEquipEffect';
import { audioService } from '../../lib/audio-service';
import { useSelectedItem } from '../../context/SelectedItemContext';
import { useCharacterStore } from '../../store/characterStore';

interface EquipmentSlotProps {
  slotName: string;
  itemName?: string;
  rarity?: string;
  icon: LucideIcon;
  description?: string;
  particles?: string;
  imageUrl?: string;
  onClear?: () => void;
  onAddClick?: () => void;
  onImpact?: () => void;
}

export function EquipmentSlot({ 
  slotName, 
  itemName, 
  rarity, 
  icon: Icon, 
  description, 
  particles, 
  imageUrl,
  onClear, 
  onAddClick,
  onImpact 
}: EquipmentSlotProps) {
  const isEmpty = !itemName;
  const { setSelected } = useSelectedItem();

  const handleSelect = () => {
    if (!isEmpty) {
      setSelected({
        id: '',
        name: itemName || '',
        type: '',
        rarity: rarity as any,
        description: description || '',
        particles: particles as any,
      } as any);
    }
  };

  const isInitialMount = React.useRef(true);
  const lastItemNameRef = React.useRef(itemName);
  const lastActionSource = useCharacterStore(s => s.lastActionSource);
  
  // Stores the new name when it arrives before rarity is resolved
  const pendingNameRef = React.useRef<string | null>(null);
  const [isDivineEquipping, setIsDivineEquipping] = React.useState(false);
  // Controls whether the divine item is visible in the slot (hidden during the cinematic)
  const [isDivineRevealed, setIsDivineRevealed] = React.useState(
    // On mount, if there's already a divine item it should be visible
    () => rarity?.toLowerCase() === 'divine' ? true : false
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastItemNameRef.current = itemName;
      return;
    }

    const nameChanged = !isEmpty && itemName !== lastItemNameRef.current;

    if (nameChanged) {
      if (rarity === undefined) {
        // rarity not resolved yet — park the name and wait
        pendingNameRef.current = itemName ?? null;
        lastItemNameRef.current = itemName;
        return;
      }
      // Process: name changed and rarity is already known
      lastItemNameRef.current = itemName;
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
  }, [itemName, rarity, isEmpty]);

  function triggerEquipEffect(resolvedRarity: string | undefined) {
    if (resolvedRarity?.toLowerCase() === 'divine') {
      // Hide the item in the slot while the cinematic plays
      setIsDivineRevealed(false);
      setIsDivineEquipping(true);
      // After the main animation (2.5s), play sound + reveal item + trigger impact
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

  const rarityColors: Record<string, string> = {
    'common': 'border-zinc-500/50',
    'rare': 'border-blue-500/50',
    'legendary': 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    'divine': 'border-red-600/80 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
  };

  const borderClass = !isEmpty && rarity ? rarityColors[rarity.toLowerCase()] || 'border-amber-800/50' : 'border-zinc-700/40';

  // For divine items: treat slot as empty while the cinematic is playing
  const showAsEmpty = isEmpty || (rarity?.toLowerCase() === 'divine' && isDivineEquipping && !isDivineRevealed);

  return (
    <>
      {/* Divine Equip Animation Overlay */}
      <DivineEquipEffect 
        name={itemName || ''} 
        icon={Icon} 
        particles={particles} 
        isVisible={isDivineEquipping} 
        imageUrl={imageUrl}
      />

      <div className={`relative group ${
        showAsEmpty
          ? `bg-zinc-900/40 border border-dashed ${borderClass} cursor-pointer hover:border-amber-700/60 hover:bg-zinc-900/60`
          : `bg-gradient-to-br from-amber-950/30 to-zinc-900/60 border ${borderClass} shadow-lg ${
              rarity?.toLowerCase() === 'divine' ? 'from-red-950/40' : ''
            }`
      } rounded-lg p-3 transition-all duration-500`}
      onClick={showAsEmpty ? onAddClick : handleSelect}>

        <AnimatePresence mode="wait">
          {!showAsEmpty ? (
            <motion.div
              key={itemName}
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
              className="w-full h-full relative"
            >
              {/* Hearthstone Impact Glow */}
              {rarity?.toLowerCase() === 'legendary' && (
                <motion.div 
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-amber-500/40 blur-2xl rounded-full pointer-events-none z-0"
                />
              )}

              {/* Divine Impact Glow */}
              {rarity?.toLowerCase() === 'divine' && (
                <motion.div 
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-red-600/40 blur-2xl rounded-full pointer-events-none z-0"
                />
              )}
              
              <ItemVFX type={particles as any} rarity={rarity} name={itemName} />

              {!isEmpty && onClear && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-950 border border-red-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-800 z-30 shadow-lg"
                >
                  <X className="w-3 h-3 text-red-100" />
                </button>
              )}

              <div className="flex flex-col h-full relative z-10">
                {/* Header: Slot Name & Rarity Sparkle */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black leading-none">{slotName}</span>
                  {(rarity?.toLowerCase() === 'legendary' || rarity?.toLowerCase() === 'divine') && <Sparkles className={`w-3 h-3 animate-pulse ${rarity?.toLowerCase() === 'divine' ? 'text-red-500' : 'text-amber-500'}`} />}
                </div>

                {/* Main Content: Item Illustration */}
                <div className="relative w-full h-16 sm:h-20 flex-shrink-0 flex items-center justify-center my-1 rounded-md overflow-hidden bg-black/20 border border-white/5 group/img">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-contain p-1.5 opacity-90 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover/img:scale-110" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isEmpty ? 'text-zinc-600' : rarity?.toLowerCase() === 'divine' ? 'text-red-500' : 'text-amber-600'} opacity-30 transition-colors`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Footer: Item Name & Rarity Label */}
                <div className="flex flex-col mt-auto">
                  <div className={`w-full text-[10px] font-black uppercase tracking-tight truncate ${
                    rarity?.toLowerCase() === 'divine' ? 'text-red-500' : rarity?.toLowerCase() === 'legendary' ? 'text-amber-400' : rarity?.toLowerCase() === 'rare' ? 'text-blue-400' : 'text-zinc-200'
                  }`}>
                    {String(itemName || '')}
                  </div>
                  <div className={`text-[7px] uppercase font-bold tracking-tighter ${
                    rarity?.toLowerCase() === 'divine' ? 'text-red-700' : 'text-zinc-600'
                  }`}>
                    {rarity?.toLowerCase() === 'divine' ? 'Divino' : String(rarity || 'Comum')}
                  </div>
                </div>
              </div>

              {description && (
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-zinc-950 border rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-95 group-hover:scale-100 origin-bottom ${
                  rarity?.toLowerCase() === 'divine' ? 'border-red-900/50' : 'border-amber-800/50'
                }`}>
                  <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 border-b pb-1 flex items-center justify-between ${
                    rarity?.toLowerCase() === 'divine' ? 'text-red-500 border-red-900/30' : 'text-amber-500 border-amber-900/30'
                  }`}>
                    <span>{slotName}</span>
                    <span className="text-zinc-500">{rarity?.toLowerCase() === 'divine' ? 'Divino' : rarity?.toLowerCase() === 'rare' ? 'Raro' : rarity?.toLowerCase() === 'legendary' ? 'Lendário' : 'Comum'}</span>
                  </div>
                  <div className="text-zinc-300 text-xs leading-relaxed">
                    <RichDescription text={description} />
                  </div>
                </div>
              )}
            </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-zinc-600 group-hover:text-amber-600 transition-colors" />
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{slotName}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 group-hover:text-amber-600 transition-colors font-bold uppercase tracking-widest">
              <Plus className="w-3 h-3" />
              <span>Equipar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
