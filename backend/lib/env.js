function isProduction() {
  return String(process.env.NODE_ENV).toLowerCase() === 'production';
}

/**
 * Fail fast in production so the API never runs with weak or missing auth/database config.
 */
function validateEnvOrExit() {
  if (!isProduction()) return;

  const errors = [];
  const mongo = process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim();
  if (!mongo) {
    errors.push('MONGODB_URI must be set in production.');
  }

  const jwt = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (!jwt || jwt.length < 32) {
    errors.push('JWT_SECRET must be set in production and be at least 32 characters (use a long random string).');
  }

  if (errors.length) {
    console.error('[env] Refusing to start in production:\n- ' + errors.join('\n- '));
    process.exit(1);
  }
}

module.exports = { isProduction, validateEnvOrExit };
