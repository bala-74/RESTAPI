require('dotenv').config();
const express = require('express');
const { initDb } = require('./database');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// ==========================================
// Health Check Endpoint
// GET /health
// ==========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Student Management API is running',
  });
});

// ==========================================
// Student Routes
// ==========================================
app.use('/students', studentRoutes);

// ==========================================
// 404 Not Found Handler for unknown routes
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

// ==========================================
// Initialize SQLite Database and Start Server
// ==========================================
initDb()
  .then(() => {
    console.log('SQLite database and table ready.');
  })
  .catch((err) => {
    console.error('Failed to initialize SQLite database:', err.message);
  });

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
