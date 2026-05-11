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
      .single();

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
    
    return { items: data || [], error: error?.message };
  },

  async createItem(itemData: any) {
    const { data, error } = await supabase
      .from('global_items')
      .insert([itemData])
      .select();
    
    return { success: !error, item: data?.[0], error: error?.message };
  },

  async updateItem(id: string, itemData: any) {
    const { data, error } = await supabase
      .from('global_items')
      .update(itemData)
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
  }
};
