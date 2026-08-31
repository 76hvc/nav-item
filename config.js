require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET?.trim();
  if (configuredSecret && configuredSecret.length >= 16) return configuredSecret;

  const databaseDir = path.join(__dirname, 'database');
  const secretPath = path.join(databaseDir, '.jwt-secret');
  fs.mkdirSync(databaseDir, { recursive: true });

  if (fs.existsSync(secretPath)) {
    const persistedSecret = fs.readFileSync(secretPath, 'utf8').trim();
    if (persistedSecret.length >= 32) return persistedSecret;
  }

  const generatedSecret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretPath, generatedSecret, { encoding: 'utf8', mode: 0o600 });
  console.warn('[security] JWT_SECRET was not configured; generated a private secret in database/.jwt-secret.');
  return generatedSecret;
}

const jwtSecret = loadJwtSecret();

module.exports = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || '123456'
  },
  server: {
    port: process.env.PORT || 3000,
    jwtSecret
  }
};
