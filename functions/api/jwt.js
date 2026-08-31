function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64UrlEncodeBytes(bytes) {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlEncodeJson(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlDecodeBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), char => char.charCodeAt(0));
}

function base64UrlDecodeJson(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlDecodeBytes(value)));
}

async function importSecret(secret, usage) {
  if (typeof secret !== 'string' || secret.length < 16) {
    throw new Error('JWT secret is missing or too short');
  }

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

async function sign(payload, secret) {
  const encodedHeader = base64UrlEncodeJson({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = base64UrlEncodeJson(payload);
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const key = await importSecret(secret, 'sign');
  const signature = await crypto.subtle.sign('HMAC', key, data);

  return `${encodedHeader}.${encodedPayload}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;
}

async function verify(token, secret) {
  const parts = typeof token === 'string' ? token.split('.') : [];
  if (parts.length !== 3 || parts.some(part => !part)) {
    throw new Error('Invalid token format');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const header = base64UrlDecodeJson(headerB64);
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported token algorithm');
  }

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const key = await importSecret(secret, 'verify');
  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlDecodeBytes(signatureB64),
    data
  );

  if (!isValid) throw new Error('Invalid signature');

  const payload = base64UrlDecodeJson(payloadB64);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(payload.exp) || payload.exp <= now) {
    throw new Error('Token expired');
  }
  if (Number.isFinite(payload.nbf) && payload.nbf > now) {
    throw new Error('Token not active');
  }

  return payload;
}

export default { sign, verify };
