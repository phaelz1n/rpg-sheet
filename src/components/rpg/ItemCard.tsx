import { LucideIcon, X, ChevronDown, Swords, ShirtIcon, Package } from 'lucide-react';
import { useState } from 'react';

interface ItemCardProps {
  name: string;
  attributeType: 'occultism' | 'dexterity' | 'vigor' | 'willpower' | 'strength' | 'faith';
  attributeIcon: LucideIcon;
  bonus: number;
  damage: string;
  category: 'weapon' | 'armor' | 'consumable';
  onNameChange?: (value: string) => void;
  onAttributeTypeChange?: (value: 'occultism' | 'dexterity' | 'vigor' | 'willpower' | 'strength' | 'faith') => void;
  onBonusChange?: (value: number) => void;
  onDamageChange?: (value: string) => void;
  onCategoryChange?: (value: 'weapon' | 'armor' | 'consumable') => void;
  onDelete?: () => void;
  onEquipAsWeapon?: () => void;
  onEquipAsArmor?: () => void;
  onAddToInventory?: () => void;
  globalAttributes?: Record<string, number>;
}

export function ItemCard({
  name,
  attributeType,
  attributeIcon: Icon,
  bonus,
  damage,
  category,
  onNameChange,
  onAttributeTypeChange,
  onBonusChange,
  onDamageChange,
  onCategoryChange,
  onDelete,
  onEquipAsWeapon,
  onEquipAsArmor,
  onAddToInventory,
  globalAttributes = {}
}: ItemCardProps) {
  const [isSelectingAttribute, setIsSelectingAttribute] = useState(false);
  const [isSelectingCategory, setIsSelectingCategory] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const globalBonus = globalAttributes[attributeType] || 0;
  const totalBonus = bonus + globalBonus;

  const attributeColors = {
    occultism: 'text-purple-400 border-purple-900/60',
    dexterity: 'text-emerald-400 border-emerald-900/60',
    vigor: 'text-red-400 border-red-900/60',
    willpower: 'text-blue-400 border-blue-900/60',
    strength: 'text-orange-400 border-orange-900/60',
    faith: 'text-amber-400 border-amber-900/60'
  };

  const categoryLabels = {
    weapon: 'Arma',
    armor: 'Armadura',
    consumable: 'Consumível'
  };

  const attributeLabels = {
    occultism: 'Ocultismo',
    dexterity: 'Destreza',
    vigor: 'Vigor',
    willpower: 'Vontade',
    strength: 'Força',
    faith: 'Fé'
  };

  const categoryIcons = {
    weapon: Swords,
    armor: ShirtIcon,
    consumable: Package
  };

  const CategoryIcon = categoryIcons[category];
  const color = attributeColors[attributeType];

  return (
    <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-900/50 rounded-lg p-4 shadow-xl hover:shadow-2xl transition-all group">

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 w-5 h-5 bg-red-900/80 border border-red-700 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-10"
        >
          <X className="w-3.5 h-3.5 text-red-100" />
        </button>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-zinc-950/80 border border-amber-800/50 rounded text-xs text-amber-400">
        <CategoryIcon className="w-3 h-3" />
        <span>{categoryLabels[category]}</span>
      </div>

      {/* Item Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange?.(e.target.value)}
        className="w-full bg-transparent text-amber-300 text-lg mb-3 mt-6 border-b border-amber-900/40 focus:border-amber-600 focus:outline-none pb-1"
        placeholder="Nome do Item"
      />

      {/* Category Selector */}
      <div className="mb-3 relative">
        <label className="text-xs text-zinc-500 uppercase mb-1 block">Categoria</label>
        <button
          onClick={() => setIsSelectingCategory(!isSelectingCategory)}
          className="w-full flex items-center justify-between bg-black/40 border border-amber-900/60 rounded p-2 hover:bg-black/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">{categoryLabels[category]}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </button>

        {isSelectingCategory && (
          <div className="absolute z-30 mt-1 w-full bg-zinc-900 border border-amber-800/50 rounded-lg shadow-2xl overflow-hidden">
            {(['weapon', 'armor', 'consumable'] as const).map((cat) => {
              const CatIcon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange?.(cat);
                    setIsSelectingCategory(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-900/20 transition-colors text-left text-sm text-zinc-300"
                >
                  <CatIcon className="w-4 h-4" />
                  {categoryLabels[cat]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Attribute Type Selector */}
      <div className="mb-3 relative">
        <label className="text-xs text-zinc-500 uppercase mb-1 block">Atributo</label>
        <button
          onClick={() => setIsSelectingAttribute(!isSelectingAttribute)}
          className={`w-full flex items-center justify-between bg-black/40 border ${color} rounded p-2 hover:bg-black/60 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color.split(' ')[0]}`} />
            <span className={`text-sm ${color.split(' ')[0]} capitalize`}>{attributeLabels[attributeType]}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </button>

        {isSelectingAttribute && (
          <div className="absolute z-30 mt-1 w-full bg-zinc-900 border border-amber-800/50 rounded-lg shadow-2xl overflow-hidden">
            {['occultism', 'dexterity', 'vigor', 'willpower', 'strength', 'faith'].map((attr) => (
              <button
                key={attr}
                onClick={() => {
                  onAttributeTypeChange?.(attr as any);
                  setIsSelectingAttribute(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-900/20 transition-colors text-left capitalize text-sm text-zinc-300"
              >
                {attributeLabels[attr as keyof typeof attributeLabels]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bonus and Damage Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Bonus */}
        <div className="bg-black/40 border border-amber-900/30 rounded p-2">
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Bônus Base</label>
          <input
            type="number"
            value={bonus}
            onChange={(e) => onBonusChange?.(Number(e.target.value))}
            className="w-full bg-transparent text-amber-400 text-xl text-center focus:outline-none"
          />
          {globalBonus !== 0 && (
            <div className="text-xs text-center mt-1">
              <span className="text-zinc-500">Atrib: </span>
              <span className="text-emerald-400">+{globalBonus}</span>
              <span className="text-zinc-500"> = </span>
              <span className="text-amber-300 font-bold">+{totalBonus}</span>
            </div>
          )}
        </div>

        {/* Damage */}
        <div className="bg-black/40 border border-red-900/30 rounded p-2">
          <label className="text-xs text-zinc-500 uppercase mb-1 block">Dano</label>
          <input
            type="text"
            value={damage}
            onChange={(e) => onDamageChange?.(e.target.value)}
            placeholder="Ex: 1d6"
            className="w-full bg-transparent text-red-400 text-xl text-center focus:outline-none placeholder:text-red-900 placeholder:text-sm"
          />
        </div>
      </div>

      {/* Total Display */}
      <div className="mb-3 pt-3 border-t border-amber-900/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">Ataque Total:</span>
          <span className="text-amber-300">
            {String(damage || '0')} {totalBonus >= 0 ? '+' : ''}{String(totalBonus)}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-full bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/50 rounded p-2 text-amber-300 text-sm hover:from-amber-900/60 hover:to-orange-900/60 transition-colors"
        >
          Equipar ou Adicionar
        </button>

        {showActions && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-amber-800/50 rounded-lg shadow-2xl overflow-hidden z-30">
            {category === 'weapon' && onEquipAsWeapon && (
              <button
                onClick={() => {
                  onEquipAsWeapon();
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-900/20 transition-colors text-left text-sm text-zinc-300"
              >
                <Swords className="w-4 h-4 text-amber-500" />
                Equipar como Arma
              </button>
            )}
            {category === 'armor' && onEquipAsArmor && (
              <button
                onClick={() => {
                  onEquipAsArmor();
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-900/20 transition-colors text-left text-sm text-zinc-300"
              >
                <ShirtIcon className="w-4 h-4 text-blue-500" />
                Equipar como Armadura
              </button>
            )}
            {onAddToInventory && (
              <button
                onClick={() => {
                  onAddToInventory();
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-900/20 transition-colors text-left text-sm text-zinc-300"
              >
                <Package className="w-4 h-4 text-green-500" />
                Adicionar ao Inventário
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
