const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { signUserToken } = require('../lib/tokens');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function dbUnavailable(res) {
  return res.status(503).json({
    ok: false,
    message:
      'Database is not connected. Set MONGODB_URI in backend/.env (MongoDB Atlas connection string) and restart the server.',
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

router.post('/register', async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);

  const { email, password, role, name } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ ok: false, message: 'Email, password, and role are required.' });
  }
  if (!['doctor', 'patient'].includes(role)) {
    return res.status(400).json({ ok: false, message: 'Role must be doctor or patient.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }
  if (String(password).length < 4) {
    return res.status(400).json({ ok: false, message: 'Password must be at least 4 characters.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ ok: false, message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    name: name != null ? String(name).trim().slice(0, 120) : '',
  });

  const token = signUserToken(user);
  return res.status(201).json({
    ok: true,
    token,
    user: { email: user.email, role: user.role, name: user.name || '' },
  });
});

router.post('/login', async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);

  const { email, password, role } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ ok: false, message: 'Email, password, and role are required.' });
  }
  if (!['doctor', 'patient'].includes(role)) {
    return res.status(400).json({ ok: false, message: 'Role must be doctor or patient.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }
  if (user.role !== role) {
    return res.status(401).json({
      ok: false,
      message: `This account is registered as a ${user.role}. Sign in with the correct role.`,
    });
  }

  const match = await bcrypt.compare(String(password), user.passwordHash);
  if (!match) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
  }

  const token = signUserToken(user);
  return res.json({
    ok: true,
    token,
    user: { email: user.email, role: user.role, name: user.name || '' },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);

  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    return res.status(401).json({ ok: false, message: 'User not found.' });
  }
  return res.json({
    ok: true,
    user: { email: user.email, role: user.role, name: user.name || '' },
  });
});

module.exports = router;
