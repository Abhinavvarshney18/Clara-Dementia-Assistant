require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const reminderRoutes = require('./routes/reminder');
const claraRoutes = require('./routes/clara');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/clara', claraRoutes);

app.post('/api/chat', (req, res) => {
  const { message = '' } = req.body;
  res.json({
    reply: claraRoutes.buildClaraReply(message || 'hello'),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'Clara backend is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Clara backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
