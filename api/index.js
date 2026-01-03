// Vercel serverless function - exports Express app
// Wrap in try-catch to handle initialization errors gracefully

let app;

try {
  const express = require('express');
  const cors = require('cors');
  const dotenv = require('dotenv');

  // Load environment variables
  dotenv.config();

  app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check - register early so it always works
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });
  });

  // Routes - load with error handling
  try {
    app.use('/api/auth', require('../backend/routes/auth'));
    app.use('/api/movies', require('../backend/routes/movies'));
    app.use('/api/reviews', require('../backend/routes/reviews'));
    app.use('/api/watchlist', require('../backend/routes/watchlist'));
    app.use('/api/stats', require('../backend/routes/stats'));
    app.use('/api/cast', require('../backend/routes/cast'));
    app.use('/api/screenwriters', require('../backend/routes/screenwriters'));
  } catch (routeError) {
    console.error('Error loading routes:', routeError);
    // Add error route
    app.use('/api/*', (req, res, next) => {
      if (req.path === '/api/health') {
        return next(); // Let health check through
      }
      res.status(500).json({ 
        error: 'Route loading failed',
        message: routeError.message
      });
    });
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Request error:', err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

} catch (initError) {
  // If Express app fails to initialize, create minimal error handler
  console.error('Failed to initialize Express app:', initError);
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: initError.message,
      stack: process.env.NODE_ENV === 'development' ? initError.stack : undefined
    });
  });
}

// Export the Express app for Vercel
module.exports = app;
