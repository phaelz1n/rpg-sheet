import { supabase } from './supabase';

export const ttrpgApi = {
  // Authentication (using Supabase Auth)
  async register(username: string, password: string) {
    const email = `${username}@ttrpg.com`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      // Create a blank character record so the user immediately appears in the admin list
      await this.saveCharacter(username, { characterName: "Nova Ficha" });
    }

    return { success: !error, error: error?.message, user: data?.user, username };

  },

  async createUser(username: string, password: string) {
    return this.register(username, password);
  },

  async login(username: string, password: string) {
    // Special admin login
    if (username === 'admin' && password === 'admin') {
      return { success: true, username: 'admin', isAdmin: true };
    }

    const email = `${username}@ttrpg.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { success: !error, error: error?.message, user: data.user, username, isAdmin: false };
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
    // Note: This is a placeholder since client-side supabase.auth.updateUser 
    // only works for the currently logged-in user. 
    // In a real app, this would be an admin edge function.
    console.log(`Resetting password for ${username} to ${password}`);
    return { success: true, error: undefined as string | undefined };
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
