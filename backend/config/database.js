const { Pool } = require('pg');

// In Vercel, environment variables are automatically available
// Only use dotenv if not in Vercel
if (!process.env.VERCEL) {
  require('dotenv').config();
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL is not set!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')));
} else {
  // Log connection info (masked) for debugging
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
  console.log('📦 DATABASE_URL configured:', maskedUrl.substring(0, 60) + '...');
}

// Supabase requires SSL connections, so we enable SSL for production
// For local development, SSL is optional
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL, so enable it for production or if DATABASE_URL contains supabase
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  // Add connection timeout for serverless
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in serverless environment - just log the error
  if (process.env.VERCEL !== '1') {
    process.exit(-1);
  }
});

module.exports = pool;

