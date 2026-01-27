import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import bcrypt from 'bcryptjs';
import jwt from './jwt.js';

const app = new Hono().basePath('/api');

// Middleware for authentication
const authMiddleware = async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: '未授权' }, 401);
  }
  const token = auth.slice(7);
  try {
    const JWT_SECRET = c.env.JWT_SECRET || 'your_jwt_secret_key';
    const payload = await jwt.verify(token, JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (e) {
    return c.json({ error: '无效token' }, 401);
  }
};

// Auth Routes
app.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return c.json({ message: '用户名或密码错误' }, 401);
  }
  
  const JWT_SECRET = c.env.JWT_SECRET || 'your_jwt_secret_key';
  const token = await jwt.sign({ id: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, JWT_SECRET);
  return c.json({ token });
});

// User Routes
app.get('/users/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  const userData = await c.env.DB.prepare('SELECT id, username FROM users WHERE id = ?').bind(user.id).first();
  return c.json({ data: userData });
});

app.put('/users/password', authMiddleware, async (c) => {
  const user = c.get('user');
  const { oldPassword, newPassword } = await c.req.json();
  
  const userData = await c.env.DB.prepare('SELECT password FROM users WHERE id = ?').bind(user.id).first();
  if (!bcrypt.compareSync(oldPassword, userData.password)) {
    return c.json({ message: '旧密码错误' }, 400);
  }
  
  const newPasswordHash = bcrypt.hashSync(newPassword, 10);
  await c.env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newPasswordHash, user.id).run();
  return c.json({ message: '密码修改成功' });
});

app.get('/users', authMiddleware, async (c) => {
  const { results: users } = await c.env.DB.prepare('SELECT id, username FROM users').all();
  return c.json({ data: users });
});

// Menus Routes
app.get('/menus', async (c) => {
  const { results: menus } = await c.env.DB.prepare('SELECT * FROM menus ORDER BY "order"').all();
  const menusWithSubMenus = await Promise.all(menus.map(async (menu) => {
    const { results: subMenus } = await c.env.DB.prepare('SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order"').bind(menu.id).all();
    return { ...menu, subMenus };
  }));
  return c.json(menusWithSubMenus);
});

app.post('/menus', authMiddleware, async (c) => {
  const { name, order } = await c.req.json();
  const result = await c.env.DB.prepare('INSERT INTO menus (name, "order") VALUES (?, ?)').bind(name, order || 0).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/menus/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, order } = await c.req.json();
  await c.env.DB.prepare('UPDATE menus SET name=?, "order"=? WHERE id=?').bind(name, order || 0, id).run();
  return c.json({ success: true });
});

app.delete('/menus/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM menus WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// Submenus
app.post('/menus/:id/submenus', authMiddleware, async (c) => {
  const parent_id = c.req.param('id');
  const { name, order } = await c.req.json();
  const result = await c.env.DB.prepare('INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)').bind(parent_id, name, order || 0).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/menus/submenus/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { name, order } = await c.req.json();
  await c.env.DB.prepare('UPDATE sub_menus SET name=?, "order"=? WHERE id=?').bind(name, order || 0, id).run();
  return c.json({ success: true });
});

app.delete('/menus/submenus/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM sub_menus WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// Cards Routes
app.get('/cards/:menuId', async (c) => {
  const menuId = c.req.param('menuId');
  const { subMenuId } = c.req.query();
  
  let query, params;
  if (subMenuId) {
    query = 'SELECT * FROM cards WHERE sub_menu_id = ? ORDER BY "order"';
    params = [subMenuId];
  } else {
    query = 'SELECT * FROM cards WHERE menu_id = ? AND sub_menu_id IS NULL ORDER BY "order"';
    params = [menuId];
  }
  
  const { results: rows } = await c.env.DB.prepare(query).bind(...params).all();
  rows.forEach(card => {
    card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
  });
  return c.json(rows);
});

app.post('/cards', authMiddleware, async (c) => {
  const { menu_id, sub_menu_id, title, url, logo_url, desc, order } = await c.req.json();
  const result = await c.env.DB.prepare('INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, desc, "order") VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(menu_id, sub_menu_id || null, title, url, logo_url, desc, order || 0).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/cards/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { menu_id, sub_menu_id, title, url, logo_url, desc, order } = await c.req.json();
  await c.env.DB.prepare('UPDATE cards SET menu_id=?, sub_menu_id=?, title=?, url=?, logo_url=?, desc=?, "order"=? WHERE id=?')
    .bind(menu_id, sub_menu_id || null, title, url, logo_url, desc, order || 0, id).run();
  return c.json({ success: true });
});

app.delete('/cards/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM cards WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// Ads Routes
app.get('/ads', async (c) => {
  const { results: data } = await c.env.DB.prepare('SELECT * FROM ads').all();
  return c.json(data);
});

app.post('/ads', authMiddleware, async (c) => {
  const { position, img, url } = await c.req.json();
  const result = await c.env.DB.prepare('INSERT INTO ads (position, img, url) VALUES (?, ?, ?)').bind(position, img, url).run();
  return c.json({ id: result.meta.last_row_id });
});

app.delete('/ads/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM ads WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// Friends Routes
app.get('/friends', async (c) => {
  const { results: data } = await c.env.DB.prepare('SELECT * FROM friends').all();
  return c.json(data);
});

app.post('/friends', authMiddleware, async (c) => {
  const { title, url, logo } = await c.req.json();
  const result = await c.env.DB.prepare('INSERT INTO friends (title, url, logo) VALUES (?, ?, ?)').bind(title, url, logo).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/friends/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { title, url, logo } = await c.req.json();
  await c.env.DB.prepare('UPDATE friends SET title=?, url=?, logo=? WHERE id=?').bind(title, url, logo, id).run();
  return c.json({ success: true });
});

app.delete('/friends/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM friends WHERE id=?').bind(id).run();
  return c.json({ success: true });
});

// Icon Fetcher API
app.get('/fetch-icon', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ error: 'URL is required' }, 400);

  try {
    const targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const response = await fetch(targetUrl.origin, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
      redirect: 'follow'
    });

    const html = await response.text();
    let iconUrl = '';

    // 1. Try to find link rel="icon" or "shortcut icon" or "apple-touch-icon"
    const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
                      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i) ||
                      html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);

    if (iconMatch && iconMatch[1]) {
      iconUrl = iconMatch[1];
    } else {
      // 2. Fallback to /favicon.ico
      iconUrl = '/favicon.ico';
    }

    // Convert relative URL to absolute
    if (iconUrl.startsWith('//')) {
      iconUrl = targetUrl.protocol + iconUrl;
    } else if (iconUrl.startsWith('/')) {
      iconUrl = targetUrl.origin + iconUrl;
    } else if (!iconUrl.startsWith('http')) {
      iconUrl = targetUrl.origin + '/' + iconUrl;
    }

    return c.json({ iconUrl });
  } catch (e) {
    return c.json({ error: 'Failed to fetch icon', details: e.message }, 500);
  }
});

export const onRequest = handle(app);
