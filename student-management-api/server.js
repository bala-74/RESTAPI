require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_db';

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
// Connect to MongoDB and Start Server
// ==========================================
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Please ensure MongoDB is running or configure MONGO_URI in .env');
  });

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
