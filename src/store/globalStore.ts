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
          id: item.id,
          name: item.name,
          attributeType: item.attributeType || 'dexterity',
          bonus: item.bonus || 0,
          damage: item.damage || '',
          category: (item.type === 'weapon' ? 'weapon' : 
                    item.type === 'armor' ? 'armor' :
                    item.type === 'material' ? 'material' : 
                    item.type === 'potion' ? 'potion' : 'consumable') as RPGItem['category'],
          equipmentSlot: item.equipmentSlot || undefined,
          corruptionLimitBonus: item.corruptionLimitBonus || 0,
          statBonus: item.statBonus || '',
          beltCapacity: item.beltCapacity || 0,
          rarity: item.rarity || 'common',
          description: item.description || ''
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
