const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:3001`;

const headers = {
  'Content-Type': 'application/json'
};

export const ttrpgApi = {
  // Register new user
  async register(username: string, password: string) {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // Login
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // Get character data
  async getCharacter(username: string) {
    const response = await fetch(`${API_BASE}/character/${username}`, {
      headers
    });
    return response.json();
  },

  // Save character data
  async saveCharacter(username: string, characterData: any) {
    const response = await fetch(`${API_BASE}/character/${username}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(characterData)
    });
    return response.json();
  },

  // Admin: Get all users
  async getAllUsers() {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers
    });
    return response.json();
  },

  // Admin: Create user
  async createUser(username: string, password: string) {
    const response = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // Admin: Delete user
  async deleteUser(username: string) {
    const response = await fetch(`${API_BASE}/admin/users/${username}`, {
      method: 'DELETE',
      headers
    });
    return response.json();
  },

  // Admin: Reset password
  async resetPassword(username: string, newPassword: string) {
    const response = await fetch(`${API_BASE}/admin/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, newPassword })
    });
    return response.json();
  },

  // Admin: Get all global items
  async getAllItems() {
    const response = await fetch(`${API_BASE}/admin/items`, {
      headers
    });
    return response.json();
  },

  // Admin: Create global item
  async createItem(itemData: any) {
    const response = await fetch(`${API_BASE}/admin/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  // Admin: Update global item
  async updateItem(id: string, itemData: any) {
    const response = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  // Admin: Delete global item
  async deleteItem(id: string) {
    const response = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'DELETE',
      headers
    });
    return response.json();
  }
};
