const fs = require('fs');
const path = require('path');

// Load dotenv from backend node_modules
const dotenv = require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv'));

// Load .env file from backend folder BEFORE requiring database config
const envPath = path.join(__dirname, '..', 'backend', '.env');
dotenv.config({ path: envPath });

// Now require the database config (which will use the loaded env vars)
const pool = require('../backend/config/database');

async function migrate() {
  try {
    // Verify DATABASE_URL is loaded
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not found in environment variables. Check your backend/.env file.');
    }
    
    console.log('Connecting to database...');
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    // Test connection first
    console.log('Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running migration...');
    await pool.query(schema);
    console.log('Database schema created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Connection Error: Cannot reach Supabase database.');
      console.error('Possible causes:');
      console.error('1. Verify your connection string in Supabase dashboard:');
      console.error('   → Go to https://supabase.com/dashboard → Your Project → Settings → Database');
      console.error('   → Copy the "URI" connection string (not "Connection Pooling")');
      console.error('   → Make sure it matches what\'s in backend/.env');
      console.error('2. Check if your firewall/antivirus is blocking the connection');
      console.error('3. Try using IPv4 explicitly (some networks have IPv6 issues)');
      console.error('4. Your Supabase project may be paused (free tier pauses after 1 week of inactivity)');
      console.error('   → Check project status in dashboard and restore if needed');
      console.error('\n💡 RECOMMENDED: Use Supabase SQL Editor instead (no connection issues):');
      console.error('   1. Go to Supabase dashboard → SQL Editor');
      console.error('   2. Click "New query"');
      console.error('   3. Copy contents of database/schema.sql');
      console.error('   4. Paste and click "Run"');
    }
    
    process.exit(1);
  }
}

migrate();

