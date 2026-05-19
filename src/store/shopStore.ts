import { create } from 'zustand';
import { Shop, RPGItem } from '../types/rpg';
import { ttrpgApi } from '../lib/ttrpg-api';
import { useCharacterStore } from './characterStore';

interface ShopStore {
  shops: Shop[];
  isLoading: boolean;
  
  loadShops: () => Promise<void>;
  saveShop: (shop: Shop) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  subscribeToShops: () => () => void;
  
  buyItem: (shopId: string, itemId: string, buyerUsername: string) => Promise<{ success: boolean; error?: string }>;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  shops: [],
  isLoading: false,

  loadShops: async () => {
    set({ isLoading: true });
    const { shops, error } = await ttrpgApi.getShops();
    if (!error) {
      set({ shops, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  saveShop: async (shop) => {
    await ttrpgApi.saveShop(shop);
    // Realtime will update the list
  },

  deleteShop: async (id) => {
    await ttrpgApi.deleteShop(id);
  },

  subscribeToShops: () => {
    return ttrpgApi.subscribeToShops(() => {
      get().loadShops();
    });
  },

  buyItem: async (shopId, itemId, buyerUsername, quantity = 1) => {
    // 0. Fetch the LATEST version of the shop from DB to avoid race conditions
    const { shops: latestShops } = await ttrpgApi.getShops();
    const shop = latestShops?.find(s => s.id === shopId);
    
    if (!shop) return { success: false, error: 'Loja não encontrada' };
    
    const shopItem = shop.inventory.find((i: any) => i.itemId === itemId);
    if (!shopItem || shopItem.stock < quantity) return { success: false, error: 'Estoque insuficiente ou item não disponível' };

    const charStore = useCharacterStore.getState();
    const totalPrice = shopItem.priceBronze * quantity;

    if (charStore.coinsBronze < totalPrice) {
      return { success: false, error: 'Moedas insuficientes' };
    }

    // 1. Get the actual RPGItem data (needed for character inventory)
    const { items } = await ttrpgApi.getAllItems();
    const rpgItem = items.find((i: any) => i.id === itemId);
    if (!rpgItem) return { success: false, error: 'Dados do item não encontrados' };

    // 2. Check Inventory Capacity and Stacking limits
    const MAX_STACK = 5;
    let remainingToAdd = quantity;
    let spaceInExistingStacks = 0;
    
    const existingInventory = [...charStore.inventory];

    existingInventory.forEach(item => {
      // Use globalItemId or fallback to name match
      if ((item.globalItemId === rpgItem.id || item.name === rpgItem.name) && item.quantity < MAX_STACK) {
        spaceInExistingStacks += (MAX_STACK - item.quantity);
      }
    });

    let newSlotsNeeded = 0;
    if (remainingToAdd > spaceInExistingStacks) {
      const itemsForNewSlots = remainingToAdd - spaceInExistingStacks;
      newSlotsNeeded = Math.ceil(itemsForNewSlots / MAX_STACK);
    }

    if (existingInventory.length + newSlotsNeeded > charStore.inventoryCapacity) {
      return { success: false, error: 'Espaço insuficiente na mochila' };
    }

    // 3. Update Inventory Logic
    // Fill existing stacks first
    for (let i = 0; i < existingInventory.length && remainingToAdd > 0; i++) {
       const item = existingInventory[i];
       if ((item.globalItemId === rpgItem.id || item.name === rpgItem.name) && item.quantity < MAX_STACK) {
          const space = MAX_STACK - item.quantity;
          const toAdd = Math.min(space, remainingToAdd);
          // Need to clone the item object to avoid mutating state directly without zustand knowing
          existingInventory[i] = { ...item, quantity: item.quantity + toAdd };
          remainingToAdd -= toAdd;
       }
    }

    // Create new stacks for the rest
    while (remainingToAdd > 0) {
       const toAdd = Math.min(MAX_STACK, remainingToAdd);
       const newInvItem = {
         id: Date.now().toString() + Math.random().toString(36).substring(7),
         globalItemId: rpgItem.id,
         name: rpgItem.name,
         quantity: toAdd,
         description: rpgItem.description || '',
         attributeType: rpgItem.attributeType,
         bonus: rpgItem.bonus,
         damage: rpgItem.damage,
         category: rpgItem.category,
         rarity: rpgItem.rarity,
         imageUrl: rpgItem.imageUrl // Keep image
       };
       existingInventory.push(newInvItem as any);
       remainingToAdd -= toAdd;
    }

    // 4. Update Shop (Shared state)
    const newShopInventory = shop.inventory.map((i: any) => 
      i.itemId === itemId ? { ...i, stock: Math.max(0, i.stock - quantity) } : i
    );

    const updatedShop = { ...shop, inventory: newShopInventory };
    const shopResponse = await ttrpgApi.saveShop(updatedShop);
    
    if (!shopResponse.success) {
      return { success: false, error: 'Erro ao atualizar estoque da loja. Tente novamente.' };
    }

    // 5. Update Character (Private state)
    charStore.removeCoins(totalPrice);
    charStore.setInventory(existingInventory);
    await charStore.saveCharacter();

    return { success: true };
  }
}));
