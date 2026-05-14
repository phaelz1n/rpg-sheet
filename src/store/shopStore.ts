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

  buyItem: async (shopId, itemId, buyerUsername) => {
    // 0. Fetch the LATEST version of the shop from DB to avoid race conditions
    const { shops: latestShops } = await ttrpgApi.getShops();
    const shop = latestShops?.find(s => s.id === shopId);
    
    if (!shop) return { success: false, error: 'Loja não encontrada' };
    
    const shopItem = shop.inventory.find(i => i.itemId === itemId);
    if (!shopItem || shopItem.stock <= 0) return { success: false, error: 'Item esgotado ou não disponível' };

    const charStore = useCharacterStore.getState();
    if (charStore.coinsBronze < shopItem.priceBronze) {
      return { success: false, error: 'Moedas insuficientes' };
    }

    // 1. Get the actual RPGItem data (needed for character inventory)
    const { items } = await ttrpgApi.getAllItems();
    const rpgItem = items.find((i: any) => i.id === itemId);
    if (!rpgItem) return { success: false, error: 'Dados do item não encontrados' };

    // 2. Update Shop (Shared state)
    // Decrement stock. If stock hits 0, it's removed from display.
    const newInventory = shop.inventory.map(i => 
      i.itemId === itemId ? { ...i, stock: i.stock - 1 } : i
    ).filter(i => i.stock > 0);

    const updatedShop = { ...shop, inventory: newInventory };
    const shopResponse = await ttrpgApi.saveShop(updatedShop);
    
    if (!shopResponse.success) {
      return { success: false, error: 'Erro ao atualizar estoque da loja. Tente novamente.' };
    }

    // 3. Update Character (Private state)
    const newInvItem = {
      id: Date.now().toString(),
      name: rpgItem.name,
      quantity: 1,
      description: rpgItem.description || '',
      attributeType: rpgItem.attributeType,
      bonus: rpgItem.bonus,
      damage: rpgItem.damage,
      category: rpgItem.category,
      rarity: rpgItem.rarity
    };

    charStore.removeCoins(shopItem.priceBronze);
    charStore.setInventory([...charStore.inventory, newInvItem as any]);
    await charStore.saveCharacter();

    return { success: true };
  }
}));
