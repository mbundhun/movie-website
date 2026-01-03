// Vercel serverless function - exports Express app
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - use relative paths from backend folder
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/movies', require('../backend/routes/movies'));
app.use('/api/reviews', require('../backend/routes/reviews'));
app.use('/api/watchlist', require('../backend/routes/watchlist'));
app.use('/api/stats', require('../backend/routes/stats'));
app.use('/api/cast', require('../backend/routes/cast'));
app.use('/api/screenwriters', require('../backend/routes/screenwriters'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Export the Express app for Vercel
module.exports = app;
