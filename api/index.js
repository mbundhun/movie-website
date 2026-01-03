// Vercel serverless function
// This exports the Express app for Vercel's serverless environment

const express = require('express');
const cors = require('cors');

// Load environment variables (Vercel provides these automatically)
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use backend routes
// Note: In Vercel, all files in the repo are available
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/movies', require('../backend/routes/movies'));
app.use('/api/reviews', require('../backend/routes/reviews'));
app.use('/api/watchlist', require('../backend/routes/watchlist'));
app.use('/api/stats', require('../backend/routes/stats'));
app.use('/api/cast', require('../backend/routes/cast'));
app.use('/api/screenwriters', require('../backend/routes/screenwriters'));

// Health check endpoint
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

// Export the Express app
module.exports = app;

