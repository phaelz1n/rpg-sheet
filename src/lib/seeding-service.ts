import { ttrpgApi } from './ttrpg-api';
import { DEFAULT_ITEMS } from './default-items';

/**
 * Seeds the database with default items.
 * Returns the number of successfully created items.
 */
export const seedDefaultItems = async (): Promise<number | null> => {
  if (!confirm('Deseja carregar a lista de itens padrão (armas, armaduras e materiais)?')) {
    return null;
  }
  
  let createdCount = 0;
  
  // Fetch existing items to avoid duplicates, but allow updating them
  const existingRes = await ttrpgApi.getAllItems();
  const existingMap = new Map((existingRes.items || []).map(i => [i.name, i]));

  for (const item of DEFAULT_ITEMS) {
    try {
      const existingItem = existingMap.get(item.name);
      
      if (existingItem) {
        // Update existing item
        const res = await ttrpgApi.updateItem(existingItem.id, item);
        if (!res.error) {
          createdCount++;
        } else {
          console.warn(`Error updating item ${item.name}:`, res.error);
        }
      } else {
        // Create new item
        const res = await ttrpgApi.createItem(item);
        if (!res.error) {
          createdCount++;
        } else {
          console.warn(`Error creating item ${item.name}:`, res.error);
        }
      }
    } catch (error) {
      console.error(`Unexpected error seeding item ${item.name}:`, error);
    }
  }
  
  return createdCount;
};
