const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!['patient', 'caregiver'].includes(role)) {
    return res.status(400).json({ error: 'Role must be patient or caregiver.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashed, role);

    // Create empty profile for patients
    if (role === 'patient') {
      db.prepare(
        'INSERT INTO patient_profiles (user_id) VALUES (?)'
      ).run(result.lastInsertRowid);

      // Log activity
      db.prepare(
        "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'account_created', 'Patient account created')"
      ).run(result.lastInsertRowid);
    }

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: result.lastInsertRowid, name, email, role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.role === 'patient') {
      db.prepare(
        "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'login', 'Patient logged in')"
      ).run(user.id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;