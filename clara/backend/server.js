require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const reminderRoutes = require('./routes/reminder');
const claraRoutes = require('./routes/clara');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/clara', claraRoutes);

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  res.json({
    reply: "You said: " + message,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Clara backend is running ✅', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`\n Clara Backend running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health\n`);
});