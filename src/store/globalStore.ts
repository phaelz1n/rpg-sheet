import { create } from 'zustand';
import { RPGItem } from '../types/rpg';
import { ttrpgApi } from '../lib/ttrpg-api';

interface GlobalStore {
  rpgItems: RPGItem[];
  isLoading: boolean;
  
  loadGlobalItems: () => Promise<void>;
  setupRealtimeSubscription: () => () => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  rpgItems: [],
  isLoading: false,

  loadGlobalItems: async () => {
    set({ isLoading: true });
    try {
      const response = await ttrpgApi.getAllItems();
      if (response.items) {
        // Map data from DB to the RPGItem interface
        const convertedItems = response.items.map((item: any) => ({
          id: String(item.id || ''),
          name: String(item.name || ''),
          attributeType: String(item.attributeType || 'dexterity'),
          bonus: Number(item.bonus || 0),
          damage: String(item.damage || ''),
          category: (item.type === 'weapon' ? 'weapon' : 
                    item.type === 'armor' ? 'armor' :
                    item.type === 'material' ? 'material' : 
                    item.type === 'potion' ? 'potion' : 'consumable') as RPGItem['category'],
          equipmentSlot: item.equipmentSlot ? String(item.equipmentSlot) : undefined,
          corruptionLimitBonus: Number(item.corruptionLimitBonus || 0),
          statBonus: String(item.statBonus || ''),
          beltCapacity: Number(item.beltCapacity || 0),
          rarity: String(item.rarity || 'common').toLowerCase(),
          description: String(item.description || ''),
          imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
          particles: item.particles ? String(item.particles) : undefined
        }));
        set({ rpgItems: convertedItems, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading global items:', error);
      set({ isLoading: false });
    }
  },

  setupRealtimeSubscription: () => {
    return ttrpgApi.subscribeToGlobalItems(() => {
      // Whenever there's an insert/update/delete on global_items, reload them
      useGlobalStore.getState().loadGlobalItems();
    });
  }
}));
