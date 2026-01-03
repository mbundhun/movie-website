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
  console.log('📦 DATABASE_URL configured:', maskedUrl.substring(0, 80) + '...');
  
  // Check if password placeholder is still in the connection string
  if (process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
    console.error('❌ ERROR: DATABASE_URL still contains [YOUR-PASSWORD] placeholder!');
    console.error('Please replace [YOUR-PASSWORD] with your actual Supabase database password in Vercel environment variables.');
  }
  
  // Extract hostname for validation
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('🔗 Database host:', url.hostname);
  } catch (e) {
    console.error('❌ Invalid DATABASE_URL format:', e.message);
  }
}

// Supabase requires SSL connections, so we enable SSL for production
// For local development, SSL is optional
let connectionString = process.env.DATABASE_URL;

// If connection string contains [YOUR-PASSWORD], it's invalid
if (connectionString && connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('❌ DATABASE_URL contains placeholder - connection will fail!');
}

// Ensure connection string has proper SSL parameters for Supabase
if (connectionString && connectionString.includes('supabase')) {
  // Add sslmode=require if not present
  if (!connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString = connectionString + separator + 'sslmode=require';
    console.log('📝 Added sslmode=require to connection string');
  }
}

const pool = new Pool({
  connectionString: connectionString,
  // Supabase requires SSL connections
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
  // Add connection timeout for serverless (increased for DNS resolution)
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  // Retry connection on failure
  max: 2, // Limit connections for serverless
  // Allow longer time for DNS resolution
  keepAlive: true
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

