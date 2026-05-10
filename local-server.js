import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {}, characters: {}, globalItems: [] }, null, 2));
}

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: {}, characters: {}, globalItems: [] };
  }
};

// Helper to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============ AUTHENTICATION ============

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const cleanUsername = username.trim();
  const db = readDB();
  
  if (db.users[cleanUsername]) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  db.users[cleanUsername] = { password: password.trim() };
  writeDB(db);
  
  res.json({ success: true, username: cleanUsername });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();
  
  if (cleanUsername === 'admin' && cleanPassword === 'admin') {
    return res.json({ success: true, username: 'admin', isAdmin: true });
  }
  
  const db = readDB();
  const user = db.users[cleanUsername];
  
  if (!user || user.password !== cleanPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ success: true, username: cleanUsername, isAdmin: false });
});

// ============ CHARACTER DATA ============

app.get('/character/:username', (req, res) => {
  const { username } = req.params;
  const db = readDB();
  const characterData = db.characters[username];
  
  if (!characterData) {
    return res.json({ exists: false });
  }
  
  res.json({ exists: true, data: characterData });
});

app.post('/character/:username', (req, res) => {
  const { username } = req.params;
  const characterData = req.body;
  
  const db = readDB();
  db.characters[username] = characterData;
  writeDB(db);
  
  res.json({ success: true });
});

// ============ ADMIN ROUTES ============

app.get('/admin/users', (req, res) => {
  const db = readDB();
  const usersWithCharacters = Object.keys(db.users).map(username => ({
    username,
    characterName: db.characters[username]?.characterName || "Sem ficha salva"
  }));
  
  res.json({ users: usersWithCharacters });
});

app.post('/admin/users', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  const cleanUsername = username.trim();
  const db = readDB();
  
  if (db.users[cleanUsername]) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  db.users[cleanUsername] = { password: password.trim() };
  writeDB(db);
  
  res.json({ success: true });
});

app.delete('/admin/users/:username', (req, res) => {
  const { username } = req.params;
  const db = readDB();
  
  delete db.users[username];
  delete db.characters[username];
  writeDB(db);
  
  res.json({ success: true });
});

app.post('/admin/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: 'Username and new password required' });
  
  const db = readDB();
  if (!db.users[username]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  db.users[username].password = newPassword.trim();
  writeDB(db);
  
  res.json({ success: true });
});

// ============ GLOBAL ITEMS (ADMIN) ============

app.get('/admin/items', (req, res) => {
  const db = readDB();
  res.json({ items: db.globalItems || [] });
});

app.post('/admin/items', (req, res) => {
  const itemData = req.body;
  const db = readDB();
  
  if (!db.globalItems) db.globalItems = [];
  
  const newItem = {
    ...itemData,
    id: Date.now().toString()
  };
  
  db.globalItems.push(newItem);
  writeDB(db);
  
  res.json({ success: true, item: newItem });
});

app.put('/admin/items/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = readDB();
  
  if (!db.globalItems) db.globalItems = [];
  const index = db.globalItems.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  db.globalItems[index] = { ...db.globalItems[index], ...updatedData };
  writeDB(db);
  
  res.json({ success: true, item: db.globalItems[index] });
});

app.delete('/admin/items/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  if (!db.globalItems) db.globalItems = [];
  db.globalItems = db.globalItems.filter(item => item.id !== id);
  writeDB(db);
  
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=============================================================`);
  console.log(`🎮 RPG Local Server running at: http://localhost:${PORT}`);
  console.log(`📂 Database file: ${DB_FILE}`);
  console.log(`=============================================================\n`);
});
