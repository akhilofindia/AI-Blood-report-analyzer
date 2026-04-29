const jwt = require('jsonwebtoken');
const { isProduction } = require('./env');

const DEV_FALLBACK =
  'dev-only-fixed-key-do-not-use-in-production-rotate-if-shared';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (secret) {
    if (isProduction() && secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production.');
    }
    return secret;
  }

  if (isProduction()) {
    throw new Error('JWT_SECRET must be set in production.');
  }

  console.warn(
    '[auth] JWT_SECRET is not set; using a development-only signing key. Set JWT_SECRET in backend/.env before production.'
  );
  return DEV_FALLBACK;
}

function signUserToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: '7d', issuer: 'health-report-api', audience: 'health-report-app' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    issuer: 'health-report-api',
    audience: 'health-report-app',
  });
}

module.exports = { getJwtSecret, signUserToken, verifyToken };
