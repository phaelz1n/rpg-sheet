import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
const app = new Hono().basePath('/server');

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTHENTICATION ============

// Register new user
app.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Check if user exists
    const existingUser = await kv.get(`user:${cleanUsername}`);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create user
    await kv.set(`user:${cleanUsername}`, { password: cleanPassword });

    // Add to users list
    const allUsers = await kv.get("all_users") || [];
    if (!allUsers.includes(cleanUsername)) {
      allUsers.push(cleanUsername);
      await kv.set("all_users", allUsers);
    }

    console.log(`User registered: ${cleanUsername}`);
    return c.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Login
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Check admin
    if (cleanUsername === "admin" && cleanPassword === "admin") {
      console.log("Admin login");
      return c.json({ success: true, username: "admin", isAdmin: true });
    }

    // Check regular user
    const user = await kv.get(`user:${cleanUsername}`);
    if (!user || user.password !== cleanPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    console.log(`User logged in: ${cleanUsername}`);
    return c.json({ success: true, username: cleanUsername, isAdmin: false });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============ CHARACTER DATA ============

// Get character data
app.get("/character/:username", async (c) => {
  try {
    const username = c.req.param("username");
    const characterData = await kv.get(`character:${username}`);

    if (!characterData) {
      return c.json({ exists: false });
    }

    return c.json({ exists: true, data: characterData });
  } catch (error) {
    console.error("Get character error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Save character data
app.post("/character/:username", async (c) => {
  try {
    const username = c.req.param("username");
    const characterData = await c.req.json();

    await kv.set(`character:${username}`, characterData);

    console.log(`Character saved for: ${username}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Save character error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============ ADMIN ROUTES ============

// Get all users
app.get("/admin/users", async (c) => {
  try {
    const allUsers = await kv.get("all_users") || [];
    const usersWithCharacters = [];

    for (const username of allUsers) {
      if (username === "admin") continue;

      const characterData = await kv.get(`character:${username}`);
      usersWithCharacters.push({
        username,
        characterName: characterData?.characterName || "Sem ficha salva"
      });
    }

    return c.json({ users: usersWithCharacters });
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Create user (admin)
app.post("/admin/users", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Check if user exists
    const existingUser = await kv.get(`user:${cleanUsername}`);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create user
    await kv.set(`user:${cleanUsername}`, { password: cleanPassword });

    // Add to users list
    const allUsers = await kv.get("all_users") || [];
    if (!allUsers.includes(cleanUsername)) {
      allUsers.push(cleanUsername);
      await kv.set("all_users", allUsers);
    }

    console.log(`Admin created user: ${cleanUsername}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Create user error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete user (admin)
app.delete("/admin/users/:username", async (c) => {
  try {
    const username = c.req.param("username");

    // Delete user credentials
    await kv.del(`user:${username}`);

    // Delete character data
    await kv.del(`character:${username}`);

    // Remove from users list
    const allUsers = await kv.get("all_users") || [];
    const updatedUsers = allUsers.filter((u: string) => u !== username);
    await kv.set("all_users", updatedUsers);

    console.log(`Admin deleted user: ${username}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Reset password (admin)
app.post("/admin/reset-password", async (c) => {
  try {
    const { username, newPassword } = await c.req.json();

    if (!username || !newPassword) {
      return c.json({ error: "Username and new password required" }, 400);
    }

    const user = await kv.get(`user:${username}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    await kv.set(`user:${username}`, { password: newPassword.trim() });

    console.log(`Admin reset password for: ${username}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// ============ GLOBAL ITEMS (ADMIN) ============

// Get all global items
app.get("/admin/items", async (c) => {
  try {
    const items = await kv.get("global_items") || [];
    return c.json({ items });
  } catch (error) {
    console.error("Get items error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Create global item (admin)
app.post("/admin/items", async (c) => {
  try {
    const itemData = await c.req.json();

    const items = await kv.get("global_items") || [];
    const newItem = {
      ...itemData,
      id: Date.now().toString()
    };

    items.push(newItem);
    await kv.set("global_items", items);

    console.log(`Admin created item: ${newItem.name}`);
    return c.json({ success: true, item: newItem });
  } catch (error) {
    console.error("Create item error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Update global item (admin)
app.put("/admin/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updatedData = await c.req.json();

    const items = await kv.get("global_items") || [];
    const index = items.findIndex((item: any) => item.id === id);

    if (index === -1) {
      return c.json({ error: "Item not found" }, 404);
    }

    items[index] = { ...items[index], ...updatedData };
    await kv.set("global_items", items);

    console.log(`Admin updated item: ${id}`);
    return c.json({ success: true, item: items[index] });
  } catch (error) {
    console.error("Update item error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete global item (admin)
app.delete("/admin/items/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const items = await kv.get("global_items") || [];
    const filteredItems = items.filter((item: any) => item.id !== id);

    await kv.set("global_items", filteredItems);

    console.log(`Admin deleted item: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete item error:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);