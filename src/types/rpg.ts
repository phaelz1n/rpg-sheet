export type AttributeType = 'occultism' | 'dexterity' | 'vigor' | 'willpower' | 'strength' | 'faith';
export type ItemCategory = 'weapon' | 'armor' | 'potion' | 'material' | 'collectible' | 'consumable';
export type EquipmentSlot = 'head' | 'neck' | 'chest' | 'gloves' | 'belt' | 'pants' | 'boots';
export type ItemRarity = 'common' | 'rare' | 'legendary' | 'divine';

export interface RPGItem {
  id: string;
  name: string;
  attributeType: AttributeType;
  attributeIcon?: any; // Will map to Lucide icons
  bonus: number;
  damage: string;
  category: ItemCategory;
  equipmentSlot?: EquipmentSlot;
  corruptionLimitBonus?: number;
  statBonus?: string;
  beltCapacity?: number;
  rarity?: ItemRarity | string;
  description?: string;
  particles?: 'none' | 'embers' | 'sparks' | 'void' | 'frost' | 'gold_dust' | 'thunder' | 'poison' | 'hologram' | 'divine' | 'cursed';
}

export interface InventoryItem extends RPGItem {
  quantity: number;
  icon?: any;
}

export interface Ability {
  id: string;
  name: string;
  type: 'action' | 'passive';
  icon: any; // Will map to Lucide icons
  manaCost?: number;
  corruptionCost?: number;
  staminaCost?: number;
  test?: string;
  damage?: string;
  effect: string;
  backlash?: string;
}

export interface WeaponState {
  name: string;
  damage: string;
  bonus: string;
  synergy: string;
  special: string;
}

export interface Curse {
  id: string;
  title: string;
  content: string;
}

export interface CharacterData {
  characterName: string;
  characterClass: string;
  characterFaction: string;
  characterCodename: string;
  characterPortrait: string;
  
  health: number;
  maxHealth: number;
  sanity: number;
  maxSanity: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  corruption: number;
  corruptionBaseMax: number;
  damageReduction: number;
  inspiration: number;

  occultism: number;
  dexterity: number;
  vigor: number;
  willpower: number;
  strength: number;
  faith: number;

  skills: {
    acrobacia: number;
    furtividade: number;
    pontaria: number;
    atletismo: number;
    intimidacao: number;
    percepcao: number;
    sobrevivencia: number;
    medicina: number;
    corrupcao: number;
    presenca: number;
  };

  abilities: Ability[];
  curses: Curse[];

  equipmentHead: string;
  equipmentNeck: string;
  equipmentChest: string;
  equipmentGloves: string;
  equipmentBelt: string;
  equipmentPants: string;
  equipmentBoots: string;
  
  beltSlot1: string;
  beltSlot2: string;
  beltSlot3: string;
  beltSlot4: string;
  beltSlot5: string;
  beltSlot6: string;
  beltSlot7: string;
  beltSlot8: string;

  mainWeapon: WeaponState;
  offWeapon: WeaponState;

  inventory: InventoryItem[];
  inventoryCapacity: number;
  rpgItems: RPGItem[];
  
  globalAttributes: Record<string, number>;
  coinsBronze: number;
}

export interface ShopItem {
  itemId: string;
  priceBronze: number;
  stock: number;
}

export interface Shop {
  id: string;
  name: string;
  npcName: string;
  npcPortrait: string;
  welcomeMessage: string;
  inventory: ShopItem[];
  location?: string;
  is_visible?: boolean;
}
