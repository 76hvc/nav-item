import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcryptjs';
import jwt from './jwt.js';

const app = new Hono().basePath('/api');
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH']);

app.use('*', async (c, next) => {
  const contentLength = Number(c.req.header('content-length') || 0);
  if (MUTATING_METHODS.has(c.req.method) && contentLength > 256 * 1024) {
    return c.json({ message: '请求内容过大' }, 413);
  }

  await next();
  c.header('Cache-Control', 'no-store');
  c.header('X-Content-Type-Options', 'nosniff');
});

function requiredText(value, fieldName, maxLength = 200) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HTTPException(400, { message: `${fieldName}不能为空` });
  }

  const result = value.trim();
  if (result.length > maxLength) {
    throw new HTTPException(400, { message: `${fieldName}长度不能超过 ${maxLength} 个字符` });
  }
  return result;
}

function optionalText(value, maxLength = 500) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new HTTPException(400, { message: '文本内容格式不正确' });
  }
  return value.trim();
}

function positiveId(value, fieldName = 'ID') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HTTPException(400, { message: `${fieldName}格式不正确` });
  }
  return id;
}

function orderValue(value) {
  const order = Number(value ?? 0);
  if (!Number.isFinite(order)) {
    throw new HTTPException(400, { message: '排序值格式不正确' });
  }
  return Math.trunc(order);
}

function normalizeUrl(value, fieldName = '网址', { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === '')) return '';
  const input = requiredText(value, fieldName, 2048);

  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
    return url.toString();
  } catch {
    throw new HTTPException(400, { message: `${fieldName}格式不正确` });
  }
}

function faviconUrl(value) {
  try {
    const hostname = new URL(value).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`;
  } catch {
    return '/default-favicon.png';
  }
}

async function readJson(c) {
  try {
    return await c.req.json();
  } catch {
    throw new HTTPException(400, { message: '请求内容必须是有效的 JSON' });
  }
}

function randomSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getJwtSecret(c) {
  const configuredSecret = c.env.JWT_SECRET?.trim();
  if (configuredSecret && configuredSecret.length >= 16) return configuredSecret;

  await c.env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS app_settings (
      "key" TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `).run();

  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO app_settings ("key", value) VALUES (?, ?)'
  ).bind('jwt_secret', randomSecret()).run();

  const row = await c.env.DB.prepare(
    'SELECT value FROM app_settings WHERE "key" = ?'
  ).bind('jwt_secret').first();

  if (!row?.value) throw new Error('Unable to initialize JWT secret');
  return row.value;
}

async function userLoginColumns(db) {
  const { results = [] } = await db.prepare('PRAGMA table_info(users)').all();
  const names = new Set(results.map(column => column.name));
  return names.has('last_login_time') && names.has('last_login_ip');
}

const authMiddleware = async (c, next) => {
  const authorization = c.req.header('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return c.json({ message: '请先登录' }, 401);
  }

  try {
    const payload = await jwt.verify(authorization.slice(7), await getJwtSecret(c));
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ message: '登录状态已过期，请重新登录' }, 401);
  }
};

app.post('/login', async c => {
  const body = await readJson(c);
  const username = requiredText(body.username, '用户名', 100);
  const password = requiredText(body.password, '密码', 200);
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first();

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return c.json({ message: '用户名或密码错误' }, 401);
  }

  let lastLoginTime = null;
  let lastLoginIp = null;
  if (await userLoginColumns(c.env.DB)) {
    lastLoginTime = user.last_login_time || null;
    lastLoginIp = user.last_login_ip || null;
    const now = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Shanghai',
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false
    }).format(new Date());
    const ip = c.req.header('CF-Connecting-IP') || '';
    await c.env.DB.prepare(
      'UPDATE users SET last_login_time = ?, last_login_ip = ? WHERE id = ?'
    ).bind(now, ip, user.id).run();
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await jwt.sign(
    { id: user.id, username: user.username, iat: now, exp: now + 2 * 60 * 60 },
    await getJwtSecret(c)
  );

  return c.json({ token, lastLoginTime, lastLoginIp });
});

app.get('/users/profile', authMiddleware, async c => {
  const user = c.get('user');
  const profile = await c.env.DB.prepare(
    'SELECT id, username FROM users WHERE id = ?'
  ).bind(user.id).first();
  if (!profile) return c.json({ message: '用户不存在' }, 404);
  return c.json({ data: profile });
});

app.get('/users/me', authMiddleware, async c => {
  const user = c.get('user');
  let query = 'SELECT id, username FROM users WHERE id = ?';
  if (await userLoginColumns(c.env.DB)) {
    query = 'SELECT id, username, last_login_time, last_login_ip FROM users WHERE id = ?';
  }
  const profile = await c.env.DB.prepare(query).bind(user.id).first();
  if (!profile) return c.json({ message: '用户不存在' }, 404);
  return c.json(profile);
});

app.put('/users/password', authMiddleware, async c => {
  const user = c.get('user');
  const body = await readJson(c);
  const oldPassword = requiredText(body.oldPassword, '旧密码', 200);
  const newPassword = requiredText(body.newPassword, '新密码', 200);
  if (newPassword.length < 6) {
    return c.json({ message: '新密码长度至少为 6 位' }, 400);
  }

  const userData = await c.env.DB.prepare(
    'SELECT password FROM users WHERE id = ?'
  ).bind(user.id).first();
  if (!userData || !bcrypt.compareSync(oldPassword, userData.password)) {
    return c.json({ message: '旧密码错误' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE users SET password = ? WHERE id = ?'
  ).bind(bcrypt.hashSync(newPassword, 10), user.id).run();
  return c.json({ message: '密码修改成功，请重新登录' });
});

app.get('/users', authMiddleware, async c => {
  const { results: users } = await c.env.DB.prepare(
    'SELECT id, username FROM users ORDER BY id'
  ).all();
  return c.json({ data: users });
});

app.get('/menus', async c => {
  const { results: menus } = await c.env.DB.prepare(
    'SELECT * FROM menus ORDER BY "order", id'
  ).all();
  const { results: subMenus } = await c.env.DB.prepare(
    'SELECT * FROM sub_menus ORDER BY "order", id'
  ).all();
  return c.json(menus.map(menu => ({
    ...menu,
    subMenus: subMenus.filter(subMenu => subMenu.parent_id === menu.id)
  })));
});

app.get('/menus/:id/submenus', async c => {
  const menuId = positiveId(c.req.param('id'), '菜单 ID');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM sub_menus WHERE parent_id = ? ORDER BY "order", id'
  ).bind(menuId).all();
  return c.json(results);
});

app.post('/menus', authMiddleware, async c => {
  const body = await readJson(c);
  const result = await c.env.DB.prepare(
    'INSERT INTO menus (name, "order") VALUES (?, ?)'
  ).bind(requiredText(body.name, '菜单名称', 100), orderValue(body.order)).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/menus/:id', authMiddleware, async c => {
  const id = positiveId(c.req.param('id'));
  const body = await readJson(c);
  await c.env.DB.prepare(
    'UPDATE menus SET name = ?, "order" = ? WHERE id = ?'
  ).bind(requiredText(body.name, '菜单名称', 100), orderValue(body.order), id).run();
  return c.json({ success: true });
});

app.delete('/menus/:id', authMiddleware, async c => {
  await c.env.DB.prepare('DELETE FROM menus WHERE id = ?')
    .bind(positiveId(c.req.param('id'))).run();
  return c.json({ success: true });
});

app.post('/menus/:id/submenus', authMiddleware, async c => {
  const parentId = positiveId(c.req.param('id'), '父菜单 ID');
  const body = await readJson(c);
  const result = await c.env.DB.prepare(
    'INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)'
  ).bind(parentId, requiredText(body.name, '子菜单名称', 100), orderValue(body.order)).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/menus/submenus/:id', authMiddleware, async c => {
  const id = positiveId(c.req.param('id'));
  const body = await readJson(c);
  await c.env.DB.prepare(
    'UPDATE sub_menus SET name = ?, "order" = ? WHERE id = ?'
  ).bind(requiredText(body.name, '子菜单名称', 100), orderValue(body.order), id).run();
  return c.json({ success: true });
});

app.delete('/menus/submenus/:id', authMiddleware, async c => {
  await c.env.DB.prepare('DELETE FROM sub_menus WHERE id = ?')
    .bind(positiveId(c.req.param('id'))).run();
  return c.json({ success: true });
});

app.get('/cards/:menuId', async c => {
  const menuId = positiveId(c.req.param('menuId'), '菜单 ID');
  const subMenuId = c.req.query('subMenuId');
  let query = 'SELECT * FROM cards WHERE menu_id = ? AND sub_menu_id IS NULL ORDER BY "order", id';
  let id = menuId;
  if (subMenuId) {
    query = 'SELECT * FROM cards WHERE sub_menu_id = ? ORDER BY "order", id';
    id = positiveId(subMenuId, '子菜单 ID');
  }

  const { results } = await c.env.DB.prepare(query).bind(id).all();
  return c.json(results.map(card => ({
    ...card,
    display_logo: card.logo_url || faviconUrl(card.url)
  })));
});

app.post('/cards', authMiddleware, async c => {
  const body = await readJson(c);
  const menuId = positiveId(body.menu_id, '菜单 ID');
  const subMenuId = body.sub_menu_id ? positiveId(body.sub_menu_id, '子菜单 ID') : null;
  const result = await c.env.DB.prepare(`
    INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, desc, "order")
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    menuId,
    subMenuId,
    requiredText(body.title, '卡片标题', 150),
    normalizeUrl(body.url),
    normalizeUrl(body.logo_url, '图标地址', { optional: true }),
    optionalText(body.desc, 500),
    orderValue(body.order)
  ).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/cards/:id', authMiddleware, async c => {
  const id = positiveId(c.req.param('id'));
  const body = await readJson(c);
  await c.env.DB.prepare(`
    UPDATE cards
    SET menu_id = ?, sub_menu_id = ?, title = ?, url = ?, logo_url = ?, desc = ?, "order" = ?
    WHERE id = ?
  `).bind(
    positiveId(body.menu_id, '菜单 ID'),
    body.sub_menu_id ? positiveId(body.sub_menu_id, '子菜单 ID') : null,
    requiredText(body.title, '卡片标题', 150),
    normalizeUrl(body.url),
    normalizeUrl(body.logo_url, '图标地址', { optional: true }),
    optionalText(body.desc, 500),
    orderValue(body.order),
    id
  ).run();
  return c.json({ success: true });
});

app.delete('/cards/:id', authMiddleware, async c => {
  const result = await c.env.DB.prepare('DELETE FROM cards WHERE id = ?')
    .bind(positiveId(c.req.param('id'))).run();
  if (!result.meta?.changes) {
    return c.json({ message: '站点不存在或已经被删除' }, 404);
  }
  return c.json({ success: true, deleted: result.meta.changes });
});

app.get('/ads', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM ads ORDER BY id').all();
  return c.json(results);
});

app.post('/ads', authMiddleware, async c => {
  const body = await readJson(c);
  const position = requiredText(body.position, '广告位置', 20);
  if (!['left', 'right'].includes(position)) {
    return c.json({ message: '广告位置只能是 left 或 right' }, 400);
  }
  const result = await c.env.DB.prepare(
    'INSERT INTO ads (position, img, url) VALUES (?, ?, ?)'
  ).bind(position, normalizeUrl(body.img, '图片地址'), normalizeUrl(body.url)).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/ads/:id', authMiddleware, async c => {
  const id = positiveId(c.req.param('id'));
  const body = await readJson(c);
  const position = body.position ? requiredText(body.position, '广告位置', 20) : null;
  if (position && !['left', 'right'].includes(position)) {
    return c.json({ message: '广告位置只能是 left 或 right' }, 400);
  }
  if (position) {
    await c.env.DB.prepare(
      'UPDATE ads SET position = ?, img = ?, url = ? WHERE id = ?'
    ).bind(position, normalizeUrl(body.img, '图片地址'), normalizeUrl(body.url), id).run();
  } else {
    await c.env.DB.prepare(
      'UPDATE ads SET img = ?, url = ? WHERE id = ?'
    ).bind(normalizeUrl(body.img, '图片地址'), normalizeUrl(body.url), id).run();
  }
  return c.json({ success: true });
});

app.delete('/ads/:id', authMiddleware, async c => {
  await c.env.DB.prepare('DELETE FROM ads WHERE id = ?')
    .bind(positiveId(c.req.param('id'))).run();
  return c.json({ success: true });
});

app.get('/friends', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM friends ORDER BY title, id').all();
  return c.json(results);
});

app.post('/friends', authMiddleware, async c => {
  const body = await readJson(c);
  const result = await c.env.DB.prepare(
    'INSERT INTO friends (title, url, logo) VALUES (?, ?, ?)'
  ).bind(
    requiredText(body.title, '友链名称', 150),
    normalizeUrl(body.url),
    normalizeUrl(body.logo, '图标地址', { optional: true })
  ).run();
  return c.json({ id: result.meta.last_row_id });
});

app.put('/friends/:id', authMiddleware, async c => {
  const body = await readJson(c);
  await c.env.DB.prepare(
    'UPDATE friends SET title = ?, url = ?, logo = ? WHERE id = ?'
  ).bind(
    requiredText(body.title, '友链名称', 150),
    normalizeUrl(body.url),
    normalizeUrl(body.logo, '图标地址', { optional: true }),
    positiveId(c.req.param('id'))
  ).run();
  return c.json({ success: true });
});

app.delete('/friends/:id', authMiddleware, async c => {
  await c.env.DB.prepare('DELETE FROM friends WHERE id = ?')
    .bind(positiveId(c.req.param('id'))).run();
  return c.json({ success: true });
});

app.get('/quick-add/menus', async c => {
  const { results: menus } = await c.env.DB.prepare(
    'SELECT id, name FROM menus ORDER BY "order", id'
  ).all();
  const { results: subMenus } = await c.env.DB.prepare(
    'SELECT id, parent_id, name FROM sub_menus ORDER BY "order", id'
  ).all();
  return c.json(menus.map(menu => ({
    ...menu,
    subMenus: subMenus.filter(subMenu => subMenu.parent_id === menu.id)
  })));
});

app.get('/fetch-icon', c => {
  const targetUrl = normalizeUrl(c.req.query('url'));
  const hostname = new URL(targetUrl).hostname;
  return c.json({
    iconUrl: `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`
  });
});

app.notFound(c => c.json({ message: '接口不存在' }, 404));

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ message: error.message }, error.status);
  }
  console.error(error);
  return c.json({ message: '服务器暂时无法处理该请求' }, 500);
});

export const onRequest = handle(app);
