const { Pool } = require('pg');
require('dotenv').config();

// Supabase requires SSL connections, so we enable SSL for production
// For local development, SSL is optional
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL, so enable it for production or if DATABASE_URL contains supabase
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false
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

