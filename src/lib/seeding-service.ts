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
  
  // Fetch existing items to avoid duplicates
  const existingRes = await ttrpgApi.getAllItems();
  const existingNames = new Set((existingRes.items || []).map(i => i.name));

  for (const item of DEFAULT_ITEMS) {
    if (existingNames.has(item.name)) {
      continue; // Skip if already exists
    }

    try {
      const res = await ttrpgApi.createItem(item);
      if (!res.error) {
        createdCount++;
      } else {
        console.warn(`Error seeding item ${item.name}:`, res.error);
      }
    } catch (error) {
      console.error(`Unexpected error seeding item ${item.name}:`, error);
    }
  }
  
  return createdCount;
};
