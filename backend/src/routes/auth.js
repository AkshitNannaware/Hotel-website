const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const normalizePhone = (value) => {
  if (!value) {
    return '';
  }
  const digits = String(value).replace(/\D/g, '');
  return digits ? `+${digits}` : '';
};

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

router.post('/signup', async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
    const normalizedPhone = normalizePhone(phone);

    if (!name || !password || (!normalizedEmail && !normalizedPhone)) {
      return res.status(400).json({ message: 'Name, password, and email or phone are required' });
    }

    const orQuery = [];
    if (normalizedEmail) {
      orQuery.push({ email: normalizedEmail });
    }
    if (normalizedPhone) {
      orQuery.push({ phone: normalizedPhone });
    }

    const existing = orQuery.length
      ? await User.findOne({ $or: orQuery })
      : null;

    if (existing) {
      return res
        .status(409)
        .json({ message: 'User already exists with this email or phone' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail || undefined,
      phone: normalizedPhone || undefined,
      role: 'user',
      passwordHash,
    });

    const token = createToken(newUser);

    res.status(201).json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const normalizedIdentifier = String(identifier || '').trim();
    const normalizedPhone = normalizePhone(normalizedIdentifier);

    if (!normalizedIdentifier || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier and password are required' });
    }

    if (!isDbConnected()) {
      return res.status(503).json({ message: 'Database not connected' });
    }

    const phoneCandidates = normalizedPhone
      ? [normalizedPhone, normalizedIdentifier]
      : [normalizedIdentifier];

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: { $in: phoneCandidates } },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
