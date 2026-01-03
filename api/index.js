// Vercel serverless function that exports the Express app
// This file is at the root level: api/index.js
// Vercel will automatically route /api/* requests to this function

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables - Vercel uses root .env, but fallback to backend/.env for local
if (process.env.VERCEL) {
  // In Vercel, environment variables are already loaded
  require('dotenv').config();
} else {
  // Local development - load from backend/.env
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Vercel routes /api/* to this function, so we mount routes at root
app.use('/auth', require('../backend/routes/auth'));
app.use('/movies', require('../backend/routes/movies'));
app.use('/reviews', require('../backend/routes/reviews'));
app.use('/watchlist', require('../backend/routes/watchlist'));
app.use('/stats', require('../backend/routes/stats'));
app.use('/cast', require('../backend/routes/cast'));
app.use('/screenwriters', require('../backend/routes/screenwriters'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Export the Express app as a serverless function
module.exports = app;

