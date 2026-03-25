const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

const CLARA_SYSTEM_PROMPT = `You are Clara, a warm, patient, and compassionate AI assistant designed to help people with dementia.`;

// GET /api/clara/history
router.get('/history', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : parseInt(req.query.patientId);

    const messages = db.prepare(
      'SELECT * FROM clara_conversations WHERE patient_id = ? ORDER BY created_at ASC LIMIT 50'
    ).all(patientId);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/clara/chat  ✅ FREE AI LOGIC
router.post('/chat', auth, (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const patientId = req.user.id;

    // Save user message
    db.prepare(
      'INSERT INTO clara_conversations (patient_id, role, message) VALUES (?, ?, ?)'
    ).run(patientId, 'user', message);

    // 🧠 SIMPLE FREE AI LOGIC
    let reply = "I'm here with you. Tell me more.";

    const msg = message.toLowerCase();

    if (msg.includes("anxious") || msg.includes("worried")) {
      reply = "I understand you're feeling anxious. Take a slow deep breath. You are safe.";
    } 
    else if (msg.includes("sad") || msg.includes("lonely")) {
      reply = "I'm sorry you're feeling sad. I'm here with you. You are not alone.";
    } 
    else if (msg.includes("medicine") || msg.includes("tablet")) {
      reply = "It's important to take your medicine on time. Would you like a reminder?";
    } 
    else if (msg.includes("hungry") || msg.includes("food")) {
      reply = "It might be a good time to eat something. Have you had your meal?";
    } 
    else if (msg.includes("confused")) {
      reply = "That's okay. Take your time. I'm here to help you.";
    }

    // Save Clara response
    db.prepare(
      'INSERT INTO clara_conversations (patient_id, role, message) VALUES (?, ?, ?)'
    ).run(patientId, 'assistant', reply);

    // Log activity
    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'clara_chat', 'Interacted with Clara')"
    ).run(patientId);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/clara/history
router.delete('/history', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM clara_conversations WHERE patient_id = ?').run(req.user.id);
    res.json({ message: 'Conversation cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;