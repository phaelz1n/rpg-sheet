import { create } from 'zustand';
import { RPGItem } from '../types/rpg';
import { ttrpgApi } from '../lib/ttrpg-api';
import { DEFAULT_ITEMS } from '../lib/default-items';

interface GlobalStore {
  rpgItems: RPGItem[];
  isLoading: boolean;
  
  loadGlobalItems: () => Promise<void>;
  setupRealtimeSubscription: () => () => void;
}

const mapRawItems = (items: any[]): RPGItem[] => {
  return items.map((item: any) => ({
    id: String(item.id || item.name || Math.random().toString()),
    name: String(item.name || ''),
    attributeType: String(item.attributeType || 'dexterity') as RPGItem['attributeType'],
    bonus: Number(item.bonus || 0),
    damage: String(item.damage || ''),
    category: (item.type === 'weapon' ? 'weapon' : 
              item.type === 'armor' ? 'armor' :
              item.type === 'material' ? 'material' : 
              item.type === 'potion' ? 'potion' : 
              item.category ? item.category : 'consumable') as RPGItem['category'],
    equipmentSlot: item.equipmentSlot ? String(item.equipmentSlot) as RPGItem['equipmentSlot'] : undefined,
    corruptionLimitBonus: Number(item.corruptionLimitBonus || 0),
    statBonus: String(item.statBonus || ''),
    beltCapacity: Number(item.beltCapacity || 0),
    rarity: String(item.rarity || 'common').toLowerCase(),
    description: String(item.description || ''),
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    particles: item.particles ? String(item.particles) as RPGItem['particles'] : undefined
  }));
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  rpgItems: [],
  isLoading: false,

  loadGlobalItems: async () => {
    set({ isLoading: true });
    try {
      const response = await ttrpgApi.getAllItems();
      if (response.items && response.items.length > 0) {
        // Map data from DB to the RPGItem interface
        set({ rpgItems: mapRawItems(response.items), isLoading: false });
      } else {
        // Fallback to DEFAULT_ITEMS if empty
        console.log('No global items in database, using offline fallback');
        set({ rpgItems: mapRawItems(DEFAULT_ITEMS), isLoading: false });
      }
    } catch (error) {
      console.error('Error loading global items, using offline fallback:', error);
      set({ rpgItems: mapRawItems(DEFAULT_ITEMS), isLoading: false });
    }
  },

  setupRealtimeSubscription: () => {
    try {
      return ttrpgApi.subscribeToGlobalItems(() => {
        // Whenever there's an insert/update/delete on global_items, reload them
        useGlobalStore.getState().loadGlobalItems();
      });
    } catch (e) {
      console.warn('Realtime subscription failed:', e);
      return () => {};
    }
  }
}));
