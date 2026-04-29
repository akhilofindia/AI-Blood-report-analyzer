const { verifyToken } = require('../lib/tokens');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Missing or invalid authorization header.' });
  }
  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Missing token.' });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    req.userEmail = payload.email;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Invalid or expired session. Please sign in again.' });
  }
}

module.exports = { requireAuth };
