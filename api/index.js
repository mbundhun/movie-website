// Vercel serverless function - exports Express app
// Fix: Load environment variables from process.env (Vercel injects them automatically)
// Fix: Ensure module resolution works by requiring from api context

let app;

try {
  const express = require('express');
  const cors = require('cors');
  
  // In Vercel, environment variables are automatically available in process.env
  // dotenv.config() is not needed, but won't hurt if .env file exists
  // Only use dotenv if we're not in Vercel
  if (!process.env.VERCEL) {
    require('dotenv').config();
  }

  app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check - register early so it always works
  app.get('/api/health', (req, res) => {
    const dbUrl = process.env.DATABASE_URL || '';
    // Mask password in DATABASE_URL for security (show only host)
    const maskedDbUrl = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'not set';
    
    // Extract hostname for debugging
    let hostname = 'unknown';
    let port = 'unknown';
    let pathname = 'unknown';
    try {
      if (dbUrl) {
        const url = new URL(dbUrl);
        hostname = url.hostname;
        port = url.port || '5432';
        pathname = url.pathname;
      }
    } catch (e) {
      hostname = 'invalid-url';
    }
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        vercel: !!process.env.VERCEL,
        databaseUrlPreview: maskedDbUrl.substring(0, 80) + (maskedDbUrl.length > 80 ? '...' : ''),
        databaseHostname: hostname,
        databasePort: port,
        databasePath: pathname,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // Database connection test endpoint
  app.get('/api/test-db', async (req, res) => {
    try {
      const pool = require('../backend/config/database');
      // Try a simple query
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
      res.json({ 
        status: 'success', 
        message: 'Database connection successful',
        data: result.rows[0]
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname,
        details: process.env.NODE_ENV === 'development' || process.env.VERCEL ? error.stack : undefined
      });
    }
  });

  // Routes - load with error handling
  // Note: In Vercel, all files are available, but module resolution
  // might need dependencies to be in api/node_modules
  try {
    // Pre-require express in the routes context by ensuring it's available globally
    // This helps with module resolution when routes require express
    if (!global.express) {
      global.express = express;
    }
    
    app.use('/api/auth', require('../backend/routes/auth'));
    app.use('/api/movies', require('../backend/routes/movies'));
    app.use('/api/reviews', require('../backend/routes/reviews'));
    app.use('/api/watchlist', require('../backend/routes/watchlist'));
    app.use('/api/stats', require('../backend/routes/stats'));
    app.use('/api/cast', require('../backend/routes/cast'));
    app.use('/api/screenwriters', require('../backend/routes/screenwriters'));
    app.use('/api/genres', require('../backend/routes/genres'));
  } catch (routeError) {
    console.error('Error loading routes:', routeError);
    console.error('Route error stack:', routeError.stack);
    // Add error route
    app.use('/api/*', (req, res, next) => {
      if (req.path === '/api/health') {
        return next(); // Let health check through
      }
      res.status(500).json({ 
        error: 'Route loading failed',
        message: routeError.message,
        details: process.env.NODE_ENV === 'development' ? routeError.stack : undefined
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
