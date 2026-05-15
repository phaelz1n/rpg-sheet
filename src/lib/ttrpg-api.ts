import { supabase } from './supabase';

export const ttrpgApi = {
  // Authentication (using custom characters table auth)
  async register(username: string, password: string) {
    // Check if user already exists
    const existing = await this.getCharacter(username);
    if (existing.exists) {
      return { success: false, error: 'Usuário já existe' };
    }

    // Insert new user into characters table with password
    const { error } = await supabase
      .from('characters')
      .insert({
        username,
        password,
        character_data: { characterName: "Nova Ficha" }
      });

    return { success: !error, error: error?.message, user: { id: username }, username };
  },

  async createUser(username: string, password: string) {
    return this.register(username, password);
  },

  async login(username: string, password: string) {
    // Special admin login
    if (username === 'admin' && password === 'admin') {
      return { success: true, username: 'admin', isAdmin: true };
    }

    // Query characters table for username and password
    const { data, error } = await supabase
      .from('characters')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    return { success: true, user: { id: username }, username, isAdmin: false };
  },

  // Character Data
  async getCharacter(username: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return { exists: false, error: error.message };
    }
    
    return { exists: !!data, data: data?.character_data };
  },

  async saveCharacter(username: string, characterData: any) {
    const { data, error } = await supabase
      .from('characters')
      .upsert({ 
        username, 
        character_data: characterData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });
    
    return { success: !error, error: error?.message };
  },

  // Admin: Users
  async getAllUsers() {
    const { data, error } = await supabase
      .from('characters')
      .select('username, character_data');
    
    const users = data?.map(char => ({
      username: char.username,
      characterName: char.character_data?.characterName || "Sem ficha salva"
    })) || [];

    return { users };
  },

  async deleteUser(username: string) {
    // Note: This only deletes character data. Real auth deletion requires Admin Auth API.
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('username', username);
    
    return { success: !error, error: error?.message };
  },

  async resetPassword(username: string, password: string) {
    console.log(`Resetting password for ${username} to ${password}`);
    const { error } = await supabase
      .from('characters')
      .update({ password })
      .eq('username', username);
    
    return { success: !error, error: error?.message };
  },

  // Admin: Global Items
  async getAllItems() {
    const { data, error } = await supabase
      .from('global_items')
      .select('*')
      .order('name');
    
      const mappedItem = {
        ...item,
        imageUrl: item.image_url // Map database field to frontend field
      };

      if (mappedItem.type?.startsWith('armor-')) {
        return {
          ...mappedItem,
          type: 'armor',
          equipmentSlot: mappedItem.type.split('-')[1]
        };
      }
      return mappedItem;
    });

    return { items: parsedItems || [], error: error?.message };
  },

  async createItem(itemData: any) {
    const payload = { ...itemData };
    if (payload.type === 'armor' && payload.equipmentSlot) {
      payload.type = `armor-${payload.equipmentSlot}`;
    }
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
    delete payload.equipmentSlot;

    const { data, error } = await supabase
      .from('global_items')
      .insert([payload])
      .select();
    
    return { success: !error, item: data?.[0], error: error?.message };
  },

  async updateItem(id: string, itemData: any) {
    const payload = { ...itemData };
    if (payload.type === 'armor' && payload.equipmentSlot) {
      payload.type = `armor-${payload.equipmentSlot}`;
    }
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
    delete payload.equipmentSlot;

    const { data, error } = await supabase
      .from('global_items')
      .update(payload)
      .eq('id', id)
      .select();
    
    return { success: !error, item: data?.[0], error: error?.message };
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('global_items')
      .delete()
      .eq('id', id);
    
    return { success: !error, error: error?.message };
  },

  // NPC Shops
  async getShops() {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('name');
    return { shops: data || [], error: error?.message };
  },

  async saveShop(shopData: any) {
    const { error } = await supabase
      .from('shops')
      .upsert(shopData, { onConflict: 'id' });
    return { success: !error, error: error?.message };
  },

  async deleteShop(id: string) {
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', id);
    return { success: !error, error: error?.message };
  },

  subscribeToShops(callback: (payload: any) => void) {
    const channel = supabase.channel('shops_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shops' },
        (payload) => callback(payload)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Realtime Subscriptions
  subscribeToCharacter(username: string, callback: (payload: any) => void) {
    const channel = supabase.channel(`character_${username}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'characters', filter: `username=eq.${username}` },
        (payload) => callback(payload)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  subscribeToGlobalItems(callback: (payload: any) => void) {
    const channel = supabase.channel('global_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'global_items' },
        (payload) => callback(payload)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Global Configs
  async getGlobalConfig(id: string) {
    const { data, error } = await supabase
      .from('global_configs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data: data?.data, error: error?.message };
  },

  async saveGlobalConfig(id: string, data: any) {
    const { error } = await supabase
      .from('global_configs')
      .upsert({ id, data, updated_at: new Date().toISOString() });
    return { success: !error, error: error?.message };
  },

  subscribeToGlobalConfig(id: string, callback: (payload: any) => void) {
    const channel = supabase.channel(`config_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'global_configs', filter: `id=eq.${id}` },
        (payload) => callback(payload)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  // Storage
  async uploadItemImage(folder: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('item-assets')
      .upload(filePath, file);

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('item-assets')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  }
};
