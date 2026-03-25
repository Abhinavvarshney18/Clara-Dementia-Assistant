const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/patient/profile
router.get('/profile', auth, (req, res) => {
  try {
    const targetId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    if (!targetId) return res.status(400).json({ error: 'Patient ID required.' });

    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(targetId);
    const profile = db.prepare('SELECT * FROM patient_profiles WHERE user_id = ?').get(targetId);

    if (!user) return res.status(404).json({ error: 'Patient not found.' });

    res.json({ user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/patient/profile
router.put('/profile', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.body.patientId);
    const {
      date_of_birth, diagnosis_date,
      emergency_contact_name, emergency_contact_phone,
      doctor_name, doctor_phone, address,
      blood_group, allergies, current_medications, notes
    } = req.body;

    db.prepare(`
      UPDATE patient_profiles SET
        date_of_birth = ?, diagnosis_date = ?,
        emergency_contact_name = ?, emergency_contact_phone = ?,
        doctor_name = ?, doctor_phone = ?,
        address = ?, blood_group = ?,
        allergies = ?, current_medications = ?,
        notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      date_of_birth, diagnosis_date,
      emergency_contact_name, emergency_contact_phone,
      doctor_name, doctor_phone, address,
      blood_group, allergies, current_medications, notes,
      patientId
    );

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'profile_updated', 'Patient profile updated')"
    ).run(patientId);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patient/activity-log
router.get('/activity-log', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    const logs = db.prepare(
      'SELECT * FROM activity_logs WHERE patient_id = ? ORDER BY logged_at DESC LIMIT 50'
    ).all(patientId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patient/mood
router.post('/mood', auth, (req, res) => {
  try {
    const patientId = req.user.id;
    const { mood, note } = req.body;
    if (!mood) return res.status(400).json({ error: 'Mood is required.' });

    db.prepare(
      'INSERT INTO mood_logs (patient_id, mood, note) VALUES (?, ?, ?)'
    ).run(patientId, mood, note || null);

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'mood_logged', ?)"
    ).run(patientId, `Mood logged: ${mood}`);

    res.status(201).json({ message: 'Mood logged.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patient/mood
router.get('/mood', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    const logs = db.prepare(
      'SELECT * FROM mood_logs WHERE patient_id = ? ORDER BY logged_at DESC LIMIT 30'
    ).all(patientId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patient/all  (caregiver only - list all patients)
router.get('/all', auth, (req, res) => {
  try {
    if (req.user.role !== 'caregiver') {
      return res.status(403).json({ error: 'Only caregivers can access this.' });
    }
    const patients = db.prepare(
      "SELECT id, name, email, created_at FROM users WHERE role = 'patient' ORDER BY name ASC"
    ).all();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/patient/emergency
router.post('/emergency', auth, (req, res) => {
  try {
    const { message, patientId } = req.body;
    const pid = req.user.role === 'patient' ? req.user.id : patientId;

    db.prepare(
      'INSERT INTO emergency_alerts (patient_id, message) VALUES (?, ?)'
    ).run(pid, message || 'Emergency alert triggered!');

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'emergency_alert', 'Emergency alert sent')"
    ).run(pid);

    res.status(201).json({ message: 'Emergency alert sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/patient/alerts
router.get('/alerts', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    const alerts = db.prepare(
      'SELECT * FROM emergency_alerts WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20'
    ).all(patientId);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/patient/alerts/:id/resolve
router.put('/alerts/:id/resolve', auth, (req, res) => {
  try {
    db.prepare(
      'UPDATE emergency_alerts SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(req.params.id);
    res.json({ message: 'Alert resolved.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;