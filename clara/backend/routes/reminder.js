const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/reminders  (get reminders for a patient)
router.get('/', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    if (!patientId) return res.status(400).json({ error: 'Patient ID required.' });

    const reminders = db.prepare(`
      SELECT r.*, u.name as created_by_name
      FROM reminders r
      JOIN users u ON r.created_by = u.id
      WHERE r.patient_id = ?
      ORDER BY r.scheduled_time ASC
    `).all(patientId);

    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/reminders/today  (today's reminders)
router.get('/today', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const reminders = db.prepare(`
      SELECT r.*, u.name as created_by_name
      FROM reminders r
      JOIN users u ON r.created_by = u.id
      WHERE r.patient_id = ? AND r.is_active = 1
        AND (
          date(r.scheduled_time) = ?
          OR r.repeat_type = 'daily'
          OR (r.repeat_type = 'weekly' AND strftime('%w', r.scheduled_time) = strftime('%w', 'now'))
        )
      ORDER BY time(r.scheduled_time) ASC
    `).all(patientId, today);

    res.json(reminders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/reminders
router.post('/', auth, (req, res) => {
  try {
    const { patient_id, title, description, type, scheduled_time, repeat_type } = req.body;

    if (!title || !type || !scheduled_time) {
      return res.status(400).json({ error: 'Title, type, and scheduled time are required.' });
    }

    const patientId = req.user.role === 'patient' ? req.user.id : patient_id;

    const result = db.prepare(`
      INSERT INTO reminders (patient_id, created_by, title, description, type, scheduled_time, repeat_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(patientId, req.user.id, title, description, type, scheduled_time, repeat_type || 'none');

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'reminder_created', ?)"
    ).run(patientId, `Reminder created: ${title}`);

    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/reminders/:id
router.put('/:id', auth, (req, res) => {
  try {
    const { title, description, type, scheduled_time, repeat_type, is_active } = req.body;

    db.prepare(`
      UPDATE reminders SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        scheduled_time = COALESCE(?, scheduled_time),
        repeat_type = COALESCE(?, repeat_type),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(title, description, type, scheduled_time, repeat_type, is_active, req.params.id);

    res.json({ message: 'Reminder updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/reminders/:id/complete
router.put('/:id/complete', auth, (req, res) => {
  try {
    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(req.params.id);
    if (!reminder) return res.status(404).json({ error: 'Reminder not found.' });

    db.prepare(
      'UPDATE reminders SET is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(req.params.id);

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'reminder_completed', ?)"
    ).run(reminder.patient_id, `Completed reminder: ${reminder.title}`);

    res.json({ message: 'Reminder marked as complete!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
    res.json({ message: 'Reminder deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;