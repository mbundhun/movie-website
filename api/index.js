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

// Simple test endpoint that doesn't require backend files
app.get('/api/test', (req, res) => {
  console.log('✅ API test endpoint called');
  res.json({ status: 'ok', message: 'API function is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Try to load backend routes with error handling
try {
  // Import and use backend routes
  app.use('/api/auth', require('../backend/routes/auth'));
  app.use('/api/movies', require('../backend/routes/movies'));
  app.use('/api/reviews', require('../backend/routes/reviews'));
  app.use('/api/watchlist', require('../backend/routes/watchlist'));
  app.use('/api/stats', require('../backend/routes/stats'));
  app.use('/api/cast', require('../backend/routes/cast'));
  app.use('/api/screenwriters', require('../backend/routes/screenwriters'));
  console.log('✅ Backend routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading backend routes:', error);
  // Add error route
  app.use('/api/*', (req, res) => {
    res.status(500).json({ 
      error: 'Backend routes failed to load', 
      message: error.message 
    });
  });
}

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
