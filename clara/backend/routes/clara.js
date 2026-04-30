const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

function buildClaraReply(message) {
  const text = message.toLowerCase();

  const responses = [
    {
      matches: ['confused', 'lost', 'where am i', 'do not remember', "don't remember"],
      reply:
        "It is okay to feel unsure. Pause for a moment and look around the room. You are using Clara, your care assistant. If you can, check your profile or call your caregiver for extra help.",
    },
    {
      matches: ['anxious', 'worried', 'scared', 'panic', 'afraid'],
      reply:
        "I am here with you. Put both feet on the floor, take one slow breath in, and let it out gently. You are not alone. If this feeling becomes strong or unsafe, please contact your caregiver.",
    },
    {
      matches: ['sad', 'lonely', 'alone', 'crying', 'upset'],
      reply:
        "I am sorry today feels heavy. You can stay here with me for a moment. A small next step may help: drink some water, sit somewhere comfortable, or call someone you trust.",
    },
    {
      matches: ['medicine', 'tablet', 'pill', 'dose', 'medication'],
      reply:
        "Medicine is important, but I should not guess your dose. Please check your reminder or medicine label. If you are unsure whether you already took it, ask your caregiver before taking more.",
    },
    {
      matches: ['water', 'thirsty', 'drink', 'hydrated'],
      reply:
        "A glass of water is a good idea. Take small sips. I can also help you create a hydration reminder so it is easier to remember later.",
    },
    {
      matches: ['hungry', 'food', 'meal', 'breakfast', 'lunch', 'dinner'],
      reply:
        "It may be time for a simple meal or snack. Check your reminders for meal time. If you feel weak, dizzy, or unwell, please tell a caregiver.",
    },
    {
      matches: ['doctor', 'appointment', 'hospital', 'visit'],
      reply:
        "Appointments can be hard to track. Check your reminders page for the time and place. If it is not listed, call your caregiver before leaving.",
    },
    {
      matches: ['pain', 'hurt', 'chest pain', 'fall', 'fell', 'bleeding', 'emergency'],
      reply:
        "I am concerned about your safety. Please contact your caregiver now. If you have chest pain, trouble breathing, heavy bleeding, or you fell and feel injured, call emergency services immediately.",
    },
    {
      matches: ['sleep', 'tired', 'night', 'cannot sleep', "can't sleep"],
      reply:
        "Try making the room quiet and comfortable. Put away bright screens, take slow breaths, and rest your body. If sleeplessness keeps happening, tell your doctor or caregiver.",
    },
    {
      matches: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      reply:
        "Hello. I am glad you are here. I can help with reminders, feelings, simple orientation, or contacting a caregiver.",
    },
  ];

  const match = responses.find((item) => item.matches.some((word) => text.includes(word)));
  if (match) return match.reply;

  return (
    "Thank you for telling me. Let us take this one step at a time. " +
    "Would you like help with a reminder, your routine, how you are feeling, or contacting a caregiver?"
  );
}

router.get('/history', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : Number(req.query.patientId);
    if (!patientId) return res.status(400).json({ error: 'Patient ID required.' });

    const messages = db.prepare(
      'SELECT * FROM clara_conversations WHERE patient_id = ? ORDER BY created_at ASC LIMIT 80',
    ).all(patientId);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/chat', auth, (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const patientId = req.user.role === 'patient' ? req.user.id : Number(req.body.patientId);
    if (!patientId) return res.status(400).json({ error: 'Patient ID required.' });

    db.prepare(
      'INSERT INTO clara_conversations (patient_id, role, message) VALUES (?, ?, ?)',
    ).run(patientId, 'user', message.trim());

    const reply = buildClaraReply(message);

    db.prepare(
      'INSERT INTO clara_conversations (patient_id, role, message) VALUES (?, ?, ?)',
    ).run(patientId, 'assistant', reply);

    db.prepare(
      "INSERT INTO activity_logs (patient_id, action, details) VALUES (?, 'clara_chat', 'Patient chatted with Clara')",
    ).run(patientId);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/history', auth, (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : Number(req.query.patientId);
    if (!patientId) return res.status(400).json({ error: 'Patient ID required.' });

    db.prepare('DELETE FROM clara_conversations WHERE patient_id = ?').run(patientId);
    res.json({ message: 'Conversation cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
module.exports.buildClaraReply = buildClaraReply;