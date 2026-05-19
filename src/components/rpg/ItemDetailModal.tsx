import React from 'react';
import { X, Sparkles, Plus, Minus, Trash2, ShieldCheck, Swords } from 'lucide-react';
import { RichDescription } from './RichDescription';
import { ItemVFX } from './ItemVFX';

export interface DetailItem {
  id: string; // Unique instance ID (for backpack items, etc.)
  globalItemId?: string; // Reference to global list ID
  name: string;
  category: string;
  rarity?: string;
  description?: string;
  particles?: string;
  imageUrl?: string;
  quantity?: number;
  damage?: string;
  bonus?: string | number;
  equipmentSlot?: string;
  // Is this item currently equipped?
  isEquipped?: boolean;
  equippedInSlot?: string; // e.g., 'mainWeapon', 'head', 'beltSlot1', etc.
}

interface ItemDetailModalProps {
  isOpen: boolean;
  item: DetailItem | null;
  onClose: () => void;
  onEquip?: (item: DetailItem, slot?: string) => void;
  onUnequip?: (item: DetailItem) => void;
  onDelete?: (item: DetailItem) => void;
  onQuantityChange?: (item: DetailItem, newQuantity: number) => void;
}

export function ItemDetailModal({
  isOpen,
  item,
  onClose,
  onEquip,
  onUnequip,
  onDelete,
  onQuantityChange
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const rarityColors: Record<string, { border: string; bg: string; text: string; label: string }> = {
    'common': { border: 'border-zinc-500/50', bg: 'bg-zinc-950/90', text: 'text-zinc-300', label: 'Comum' },
    'rare': { border: 'border-blue-500/50', bg: 'bg-blue-950/20', text: 'text-blue-400', label: 'Raro' },
    'legendary': { border: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]', bg: 'bg-amber-950/20', text: 'text-amber-400', label: 'Lendário' },
    'divine': { border: 'border-red-600/80 shadow-[0_0_20px_rgba(220,38,38,0.5)]', bg: 'bg-red-950/20', text: 'text-red-500', label: 'Divino' }
  };

  const itemRarity = (item.rarity || 'common').toLowerCase();
  const colors = rarityColors[itemRarity] || rarityColors.common;

  // Check if item is equipable and what slots it supports
  const isWeapon = item.category === 'weapon';
  const isArmor = item.category === 'armor';
  const isEquipable = isWeapon || isArmor || item.equipmentSlot !== undefined;

  const getSlotDisplayName = (slot: string) => {
    switch (slot) {
      case 'head': return 'Cabeça';
      case 'neck': return 'Pescoço';
      case 'chest': return 'Peito';
      case 'gloves': return 'Luvas';
      case 'belt': return 'Cinto';
      case 'pants': return 'Calças';
      case 'boots': return 'Botas';
      case 'mainWeapon': return 'Mão Direita';
      case 'offWeapon': return 'Mão Esquerda';
      default:
        if (slot.startsWith('beltSlot')) {
          return `Cinto (Slot ${slot.replace('beltSlot', '')})`;
        }
        return slot;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className={`bg-gradient-to-br from-zinc-950 to-black border ${colors.border} rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-950" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors bg-black/40 border border-zinc-800/80 p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* Header & Preview Section */}
          <div className="flex flex-col items-center text-center mt-2 relative">
            {/* Visual Effects */}
            <ItemVFX type={item.particles as any} rarity={itemRarity} name={item.name} />

            <div className={`relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center rounded-xl bg-black/40 border ${colors.border} mb-3 overflow-hidden group/img`}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-zinc-800 opacity-20 text-4xl">?</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 leading-tight ${colors.text}`}>
              {item.name}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold tracking-tighter ${
                itemRarity === 'divine' ? 'bg-red-950/40 border-red-500 text-red-400' :
                itemRarity === 'legendary' ? 'bg-amber-950/40 border-amber-500 text-amber-400' :
                itemRarity === 'rare' ? 'bg-blue-950/40 border-blue-500 text-blue-400' :
                'bg-zinc-900/40 border-zinc-700 text-zinc-500'
              }`}>
                {colors.label}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{item.category}</span>
            </div>
          </div>

          {/* Stats Box (If weapon or has specific attributes) */}
          {(item.damage || item.bonus !== undefined) && (
            <div className="bg-black/40 border border-amber-900/20 rounded-xl p-3 flex justify-around text-center">
              {item.damage && (
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black block">Dano</span>
                  <span className="text-sm font-bold text-red-400">{item.damage}</span>
                </div>
              )}
              {item.bonus !== undefined && (
                <div>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black block">Bônus</span>
                  <span className="text-sm font-bold text-emerald-400">+{item.bonus}</span>
                </div>
              )}
            </div>
          )}

          {/* Description Block */}
          {item.description && (
            <div className="bg-black/60 rounded-xl p-4 border border-zinc-900 text-zinc-300 text-sm leading-relaxed max-h-40 overflow-y-auto custom-scrollbar text-left">
              <RichDescription text={item.description} />
            </div>
          )}

          {/* Location info */}
          {item.isEquipped && item.equippedInSlot && (
            <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Equipado no slot: {getSlotDisplayName(item.equippedInSlot)}
            </div>
          )}

          {/* Quantity Controls (Only if in inventory and quantity exists) */}
          {!item.isEquipped && item.quantity !== undefined && onQuantityChange && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black text-center">Quantidade na Mochila</span>
              <div className="flex items-center gap-4 bg-black/40 p-2 rounded-xl border border-zinc-800/80 justify-center">
                <button
                  onClick={() => onQuantityChange(item, Math.max(1, item.quantity! - 1))}
                  disabled={item.quantity <= 1}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                
                <span className="w-12 text-center text-2xl font-black text-white">{item.quantity}</span>

                <button
                  onClick={() => onQuantityChange(item, Math.min(5, item.quantity! + 1))}
                  disabled={item.quantity >= 5}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="flex flex-col gap-2 mt-2">
            {/* Equip actions */}
            {!item.isEquipped && isEquipable && onEquip && (
              <>
                {isWeapon ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onEquip(item, 'main');
                        onClose();
                      }}
                      className="flex-1 py-3.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 rounded-xl text-black font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                    >
                      <Swords className="w-4 h-4" />
                      Mão Direita
                    </button>
                    <button
                      onClick={() => {
                        onEquip(item, 'off');
                        onClose();
                      }}
                      className="flex-1 py-3.5 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-xl text-zinc-200 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Swords className="w-4 h-4" />
                      Mão Esquerda
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onEquip(item);
                      onClose();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 rounded-xl text-black font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Equipar Item
                  </button>
                )}
              </>
            )}

            {/* Unequip action */}
            {item.isEquipped && onUnequip && (
              <button
                onClick={() => {
                  onUnequip(item);
                  onClose();
                }}
                className="w-full py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-amber-500 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
              >
                Desequipar Item
              </button>
            )}

            {/* Delete/Discard action (only if not equipped) */}
            {!item.isEquipped && onDelete && (
              <button
                onClick={() => {
                  onDelete(item);
                  onClose();
                }}
                className="w-full py-3.5 bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 rounded-xl text-red-300 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                Excluir da Mochila
              </button>
            )}

            {/* Close Button at bottom (for clean exit) */}
            <button
              onClick={onClose}
              className="w-full mt-1 py-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-wider font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
