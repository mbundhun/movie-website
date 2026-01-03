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

// For Supabase pooler connections, we'll handle SSL via Pool config, not connection string
// Remove any sslmode parameters from connection string to avoid conflicts
if (connectionString && connectionString.includes('supabase')) {
  connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  console.log('📝 Removed sslmode from connection string (using Pool SSL config instead)');
}

// Determine SSL configuration
// For Supabase (including pooler), always use SSL with rejectUnauthorized: false
// This handles self-signed certificates in the chain
const isSupabase = connectionString && connectionString.includes('supabase');
const sslConfig = (process.env.NODE_ENV === 'production' || isSupabase) 
  ? { 
      rejectUnauthorized: false // Required for Supabase pooler connections with self-signed certs
    } 
  : false;

if (isSupabase && sslConfig) {
  console.log('🔒 SSL configured for Supabase (rejectUnauthorized: false)');
}

// Create pool with explicit SSL configuration
// For Supabase pooler, we MUST set rejectUnauthorized: false to handle self-signed certs
const poolConfig = {
  connectionString: connectionString,
  // Add connection timeout for serverless
  connectionTimeoutMillis: 20000,
  idleTimeoutMillis: 30000,
  // Retry connection on failure
  max: 2, // Limit connections for serverless
  // Allow longer time for DNS resolution
  keepAlive: true
};

// Explicitly set SSL config - this is critical for Supabase pooler
if (sslConfig) {
  poolConfig.ssl = sslConfig;
  console.log('🔒 Pool SSL config set:', JSON.stringify(sslConfig));
} else {
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);

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

