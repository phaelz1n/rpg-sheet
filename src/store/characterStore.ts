import { create } from 'zustand';
import { CharacterData, InventoryItem, Ability, Curse, WeaponState } from '../types/rpg';
import { ttrpgApi } from '../lib/ttrpg-api';

interface CharacterStore extends CharacterData {
  isLoading: boolean;
  username: string | null;
  lastLocalUpdate: number; // Timestamp da última alteração local
  
  // Actions
  setUsername: (username: string) => void;
  loadCharacter: (username: string, force?: boolean) => Promise<void>;
  saveCharacter: () => Promise<void>;
  
  updateField: <K extends keyof CharacterData>(field: K, value: CharacterData[K]) => void;
  updateSkill: (skill: keyof CharacterData['skills'], value: number) => void;
  updateGlobalAttribute: (attribute: string, value: number) => void;
  
  // Equipment Actions
  equipWeapon: (slot: 'main' | 'off', weapon: WeaponState) => void;
  equipArmor: (slot: string, itemName: string) => void;
  updateBeltSlot: (slotNum: string, itemName: string) => void;
  
  // Inventory Actions
  updateInventoryQuantity: (id: string, newQuantity: number) => void;
  removeFromInventory: (id: string) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  
  // Abilities Actions
  addAbility: (ability: Ability) => void;
  updateAbility: (id: string, field: string, value: any) => void;
  removeAbility: (id: string) => void;
  
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
}

const defaultState: CharacterData = {
  characterName: '',
  characterClass: '',
  characterFaction: '',
  characterCodename: '',
  characterPortrait: '',
  health: 0,
  maxHealth: 10,
  sanity: 0,
  maxSanity: 10,
  mana: 0,
  maxMana: 10,
  stamina: 0,
  maxStamina: 6,
  corruption: 0,
  corruptionBaseMax: 10,
  damageReduction: 0,
  inspiration: 0,
  occultism: 0,
  dexterity: 0,
  vigor: 0,
  willpower: 0,
  strength: 0,
  faith: 0,
  skills: {
    acrobacia: 0, furtividade: 0, pontaria: 0, atletismo: 0,
    intimidacao: 0, percepcao: 0, sobrevivencia: 0,
    medicina: 0, corrupcao: 0, presenca: 0
  },
  abilities: [],
  curses: [],
  equipmentHead: '',
  equipmentNeck: '',
  equipmentChest: '',
  equipmentGloves: '',
  equipmentBelt: '',
  equipmentPants: '',
  equipmentBoots: '',
  beltSlot1: '', beltSlot2: '', beltSlot3: '', beltSlot4: '',
  beltSlot5: '', beltSlot6: '', beltSlot7: '', beltSlot8: '',
  mainWeapon: { name: '', damage: '', bonus: '', synergy: '', special: '' },
  offWeapon: { name: '', damage: '', bonus: '', synergy: '', special: '' },
  inventory: [],
  inventoryCapacity: 8,
  rpgItems: [],
  globalAttributes: {
    occultism: 0, dexterity: 0, vigor: 0, willpower: 0, strength: 0, faith: 0
  },
  coinsBronze: 0
};

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  ...defaultState,
  isLoading: false,
  username: null,
  lastLocalUpdate: 0,

  setUsername: (username) => set({ username }),

  loadCharacter: async (username, force = false) => {
    // Se não for forçado, ignorar atualizações se houver mudança local recente (evita race condition)
    if (!force && Date.now() - get().lastLocalUpdate < 3000) {
      return;
    }

    set({ isLoading: true, username });
    try {
      const response = await ttrpgApi.getCharacter(username);
      if (response.exists && response.data) {
        set({ ...defaultState, ...response.data, isLoading: false });
      } else {
        set({ ...defaultState, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading character:', error);
      set({ isLoading: false });
    }
  },

  saveCharacter: async () => {
    const state = get();
    if (!state.username) return;

    // Build the payload
    const payload: CharacterData = {
      characterName: state.characterName,
      characterClass: state.characterClass,
      characterFaction: state.characterFaction,
      characterCodename: state.characterCodename,
      characterPortrait: state.characterPortrait,
      health: state.health,
      maxHealth: state.maxHealth,
      sanity: state.sanity,
      maxSanity: state.maxSanity,
      mana: state.mana,
      maxMana: state.maxMana,
      stamina: state.stamina,
      maxStamina: state.maxStamina,
      corruption: state.corruption,
      corruptionBaseMax: state.corruptionBaseMax,
      damageReduction: state.damageReduction,
      inspiration: state.inspiration,
      occultism: state.occultism,
      dexterity: state.dexterity,
      vigor: state.vigor,
      willpower: state.willpower,
      strength: state.strength,
      faith: state.faith,
      skills: state.skills,
      abilities: state.abilities,
      curses: state.curses,
      equipmentHead: state.equipmentHead,
      equipmentNeck: state.equipmentNeck,
      equipmentChest: state.equipmentChest,
      equipmentGloves: state.equipmentGloves,
      equipmentBelt: state.equipmentBelt,
      equipmentPants: state.equipmentPants,
      equipmentBoots: state.equipmentBoots,
      beltSlot1: state.beltSlot1,
      beltSlot2: state.beltSlot2,
      beltSlot3: state.beltSlot3,
      beltSlot4: state.beltSlot4,
      beltSlot5: state.beltSlot5,
      beltSlot6: state.beltSlot6,
      beltSlot7: state.beltSlot7,
      beltSlot8: state.beltSlot8,
      mainWeapon: state.mainWeapon,
      offWeapon: state.offWeapon,
      inventory: state.inventory,
      inventoryCapacity: state.inventoryCapacity,
      rpgItems: state.rpgItems,
      globalAttributes: state.globalAttributes,
      coinsBronze: state.coinsBronze
    };

    try {
      await ttrpgApi.saveCharacter(state.username, payload);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  },

  updateField: (field, value) => set({ [field]: value, lastLocalUpdate: Date.now() }),

  updateSkill: (skill, value) => set((state) => ({
    skills: { ...state.skills, [skill]: value },
    lastLocalUpdate: Date.now()
  })),

  updateGlobalAttribute: (attribute, value) => set((state) => ({
    globalAttributes: { ...state.globalAttributes, [attribute]: value },
    lastLocalUpdate: Date.now()
  })),

  equipWeapon: (slot, weapon) => set((state) => ({
    [slot === 'main' ? 'mainWeapon' : 'offWeapon']: weapon,
    lastLocalUpdate: Date.now()
  })),

  equipArmor: (slot, itemName) => set((state) => {
    const now = Date.now();
    switch (slot) {
      case 'head': return { equipmentHead: itemName, lastLocalUpdate: now };
      case 'neck': return { equipmentNeck: itemName, lastLocalUpdate: now };
      case 'chest': return { equipmentChest: itemName, lastLocalUpdate: now };
      case 'gloves': return { equipmentGloves: itemName, lastLocalUpdate: now };
      case 'belt': return { equipmentBelt: itemName, lastLocalUpdate: now };
      case 'pants': return { equipmentPants: itemName, lastLocalUpdate: now };
      case 'boots': return { equipmentBoots: itemName, lastLocalUpdate: now };
      default: return state;
    }
  }),

  updateBeltSlot: (slotNum, itemName) => set((state) => {
    const slotKey = `beltSlot${slotNum}` as keyof CharacterData;
    return { [slotKey]: itemName, lastLocalUpdate: Date.now() };
  }),

  updateInventoryQuantity: (id, newQuantity) => set((state) => ({
    inventory: state.inventory.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ),
    lastLocalUpdate: Date.now()
  })),

  removeFromInventory: (id) => set((state) => ({
    inventory: state.inventory.filter(item => item.id !== id),
    lastLocalUpdate: Date.now()
  })),

  setInventory: (inventory) => set({ inventory, lastLocalUpdate: Date.now() }),

  addAbility: (ability) => set((state) => {
    if (state.abilities.length >= 4) return state;
    return { abilities: [...state.abilities, ability], lastLocalUpdate: Date.now() };
  }),

  updateAbility: (id, field, value) => set((state) => ({
    abilities: state.abilities.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ),
    lastLocalUpdate: Date.now()
  })),

  removeAbility: (id) => set((state) => ({
    abilities: state.abilities.filter(a => a.id !== id),
    lastLocalUpdate: Date.now()
  })),

  addCoins: (amount) => set((state) => ({
    coinsBronze: state.coinsBronze + amount,
    lastLocalUpdate: Date.now()
  })),

  removeCoins: (amount) => set((state) => ({
    coinsBronze: Math.max(0, state.coinsBronze - amount),
    lastLocalUpdate: Date.now()
  }))
}));
