import { create } from 'zustand';
import { CharacterData, InventoryItem, Ability, Curse, WeaponState } from '../types/rpg';
import { ttrpgApi } from '../lib/ttrpg-api';

interface CharacterStore extends CharacterData {
  isLoading: boolean;
  username: string | null;
  lastLocalUpdate: number; // Timestamp da última alteração local
  lastActionSource: 'local' | 'remote' | 'initial';
  
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
  mainWeapon: { id: '', name: '', damage: '', bonus: '', synergy: '', special: '', imageUrl: '' },
  offWeapon: { id: '', name: '', damage: '', bonus: '', synergy: '', special: '', imageUrl: '' },
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
  lastActionSource: 'initial',

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
        const d = response.data;
        const sanitizedData: Partial<CharacterData> = {
          characterName: String(d.characterName || ''),
          characterClass: String(d.characterClass || ''),
          characterFaction: String(d.characterFaction || ''),
          characterCodename: String(d.characterCodename || ''),
          characterPortrait: String(d.characterPortrait || ''),
          health: Number(d.health || 0),
          maxHealth: Number(d.maxHealth || 10),
          sanity: Number(d.sanity || 0),
          maxSanity: Number(d.maxSanity || 10),
          mana: Number(d.mana || 0),
          maxMana: Number(d.maxMana || 10),
          stamina: Number(d.stamina || 0),
          maxStamina: Number(d.maxStamina || 6),
          corruption: Number(d.corruption || 0),
          corruptionBaseMax: Number(d.corruptionBaseMax || 10),
          damageReduction: Number(d.damageReduction || 0),
          inspiration: Number(d.inspiration || 0),
          occultism: Number(d.occultism || 0),
          dexterity: Number(d.dexterity || 0),
          vigor: Number(d.vigor || 0),
          willpower: Number(d.willpower || 0),
          strength: Number(d.strength || 0),
          faith: Number(d.faith || 0),
          coinsBronze: Number(d.coinsBronze || 0),
          equipmentHead: String(d.equipmentHead || ''),
          equipmentNeck: String(d.equipmentNeck || ''),
          equipmentChest: String(d.equipmentChest || ''),
          equipmentGloves: String(d.equipmentGloves || ''),
          equipmentBelt: String(d.equipmentBelt || ''),
          equipmentPants: String(d.equipmentPants || ''),
          equipmentBoots: String(d.equipmentBoots || ''),
          beltSlot1: String(d.beltSlot1 || ''),
          beltSlot2: String(d.beltSlot2 || ''),
          beltSlot3: String(d.beltSlot3 || ''),
          beltSlot4: String(d.beltSlot4 || ''),
          beltSlot5: String(d.beltSlot5 || ''),
          beltSlot6: String(d.beltSlot6 || ''),
          beltSlot7: String(d.beltSlot7 || ''),
          beltSlot8: String(d.beltSlot8 || ''),
          inventoryCapacity: Number(d.inventoryCapacity || 8),
          mainWeapon: {
            id: String(d.mainWeapon?.id || ''),
            name: String(d.mainWeapon?.name || ''),
            damage: String(d.mainWeapon?.damage || ''),
            bonus: String(d.mainWeapon?.bonus || ''),
            synergy: String(d.mainWeapon?.synergy || ''),
            special: String(d.mainWeapon?.special || ''),
            imageUrl: String(d.mainWeapon?.imageUrl || '')
          },
          offWeapon: {
            id: String(d.offWeapon?.id || ''),
            name: String(d.offWeapon?.name || ''),
            damage: String(d.offWeapon?.damage || ''),
            bonus: String(d.offWeapon?.bonus || ''),
            synergy: String(d.offWeapon?.synergy || ''),
            special: String(d.offWeapon?.special || ''),
            imageUrl: String(d.offWeapon?.imageUrl || '')
          },
          skills: d.skills ? {
            acrobacia: Number(d.skills.acrobacia || 0),
            furtividade: Number(d.skills.furtividade || 0),
            pontaria: Number(d.skills.pontaria || 0),
            atletismo: Number(d.skills.atletismo || 0),
            intimidacao: Number(d.skills.intimidacao || 0),
            percepcao: Number(d.skills.percepcao || 0),
            sobrevivencia: Number(d.skills.sobrevivencia || 0),
            medicina: Number(d.skills.medicina || 0),
            corrupcao: Number(d.skills.corrupcao || 0),
            presenca: Number(d.skills.presenca || 0),
          } : defaultState.skills,
          abilities: Array.isArray(d.abilities) ? d.abilities.map((a: any) => ({
            id: String(a.id || ''),
            name: String(a.name || ''),
            type: a.type || 'action',
            effect: String(a.effect || ''),
            manaCost: a.manaCost !== undefined ? Number(a.manaCost) : undefined,
            corruptionCost: a.corruptionCost !== undefined ? Number(a.corruptionCost) : undefined,
            staminaCost: a.staminaCost !== undefined ? Number(a.staminaCost) : undefined,
            test: a.test ? String(a.test) : undefined,
            damage: a.damage ? String(a.damage) : undefined,
            backlash: a.backlash ? String(a.backlash) : undefined,
          })) : [],
          curses: Array.isArray(d.curses) ? d.curses.map((c: any) => ({
            id: String(c.id || ''),
            title: String(c.title || ''),
            content: String(c.content || '')
          })) : [],
          inventory: Array.isArray(d.inventory) ? d.inventory.map((i: any) => ({
            id: String(i.id || ''),
            name: String(i.name || ''),
            quantity: Number(i.quantity || 1),
            description: String(i.description || ''),
            attributeType: i.attributeType,
            bonus: i.bonus,
            damage: i.damage,
            category: i.category,
            rarity: i.rarity ? String(i.rarity).toLowerCase() : undefined,
            imageUrl: i.imageUrl,
            globalItemId: i.globalItemId
          })) : []
        };
        set({ ...defaultState, ...sanitizedData, isLoading: false, lastActionSource: 'remote' });
      } else {
        set({ ...defaultState, isLoading: false, lastActionSource: 'remote' });
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
      set({ lastActionSource: 'remote' });
    } catch (error) {
      console.error('Error saving character:', error);
    }
  },

  updateField: (field, value) => {
    const currentState = get();
    if (field === 'corruption' && typeof value === 'number' && value > currentState.corruption) {
      import('../lib/audio-service').then(({ audioService }) => {
        audioService.playSound('CORRUPTION_GAINED');
      });
    }
    set((state) => ({ ...state, [field]: value, lastLocalUpdate: Date.now(), lastActionSource: 'local' }));
  },

  updateSkill: (skill, value) => set((state) => ({
    skills: { ...state.skills, [skill]: value },
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  updateGlobalAttribute: (attribute, value) => set((state) => ({
    globalAttributes: { ...state.globalAttributes, [attribute]: value },
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  equipWeapon: (slot, weapon) => set((state) => ({
    [slot === 'main' ? 'mainWeapon' : 'offWeapon']: weapon,
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  equipArmor: (slot, itemName) => set((state) => {
    const now = Date.now();
    const source = 'local';
    switch (slot) {
      case 'head': return { equipmentHead: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'neck': return { equipmentNeck: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'chest': return { equipmentChest: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'gloves': return { equipmentGloves: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'belt': return { equipmentBelt: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'pants': return { equipmentPants: itemName, lastLocalUpdate: now, lastActionSource: source };
      case 'boots': return { equipmentBoots: itemName, lastLocalUpdate: now, lastActionSource: source };
      default: return state;
    }
  }),

  updateBeltSlot: (slotNum, itemName) => set((state) => {
    const slotKey = `beltSlot${slotNum}` as keyof CharacterData;
    return { [slotKey]: itemName, lastLocalUpdate: Date.now(), lastActionSource: 'local' };
  }),

  updateInventoryQuantity: (id, newQuantity) => set((state) => ({
    inventory: state.inventory.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ),
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  removeFromInventory: (id) => set((state) => ({
    inventory: state.inventory.filter(item => item.id !== id),
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  setInventory: (inventory) => set({ inventory, lastLocalUpdate: Date.now(), lastActionSource: 'local' }),

  addAbility: (ability) => set((state) => {
    if (state.abilities.length >= 4) return state;
    return { abilities: [...state.abilities, ability], lastLocalUpdate: Date.now(), lastActionSource: 'local' };
  }),

  updateAbility: (id, field, value) => set((state) => ({
    abilities: state.abilities.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ),
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  removeAbility: (id) => set((state) => ({
    abilities: state.abilities.filter(a => a.id !== id),
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  addCoins: (amount) => set((state) => ({
    coinsBronze: state.coinsBronze + amount,
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  })),

  removeCoins: (amount) => set((state) => ({
    coinsBronze: Math.max(0, state.coinsBronze - amount),
    lastLocalUpdate: Date.now(),
    lastActionSource: 'local'
  }))
}));
