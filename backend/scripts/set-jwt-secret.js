/**
 * Ensures backend/.env has a strong JWT_SECRET (does not print the secret).
 * Run from repo root: node backend/scripts/set-jwt-secret.js
 * Or from backend: node scripts/set-jwt-secret.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const backendRoot = path.join(__dirname, '..');
const envPath = path.join(backendRoot, '.env');

if (!fs.existsSync(envPath)) {
  console.error('[set-jwt-secret] Missing backend/.env — copy backend/.env.example to backend/.env and set MONGODB_URI.');
  process.exit(1);
}

let raw = fs.readFileSync(envPath, 'utf8');
const secret = crypto.randomBytes(64).toString('hex');

if (/^JWT_SECRET=/m.test(raw)) {
  raw = raw.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);
} else {
  raw = raw.replace(/\s*$/, '') + `\nJWT_SECRET=${secret}\n`;
}

fs.writeFileSync(envPath, raw, 'utf8');
console.log('[set-jwt-secret] JWT_SECRET written to backend/.env (128 hex chars).');
