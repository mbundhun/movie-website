# Supabase Setup Guide

This guide provides detailed instructions for setting up Supabase as your database for the Movie Review Website.

## Why Supabase?

- ✅ **Free tier never expires** (unlike Render's database)
- ✅ 500 MB database storage (plenty for thousands of movies)
- ✅ 2 GB bandwidth per month
- ✅ Automatic daily backups
- ✅ PostgreSQL compatible (works with existing code)
- ✅ SSL connections by default
- ✅ Easy-to-use dashboard

## Step-by-Step Setup

### 1. Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub, Google, or email

### 2. Create New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in the project details:
   - **Name**: `movie-website` (or your choice)
   - **Database Password**: Create a strong password
     - ⚠️ **IMPORTANT**: Save this password! You'll need it for the connection string
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select **Free**
3. Click "Create new project"
4. Wait 2-3 minutes for provisioning

### 3. Get Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon in left sidebar)
2. Click **Database** in the settings menu
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with the password you created in step 2
   
   Example format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

   After replacing password:
   ```
   postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres
   ```

### 4. Create Database Tables

#### Option A: Using Supabase SQL Editor (Easiest)

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `database/schema.sql` from this project
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"
8. Verify tables were created:
   - Click **Table Editor** in left sidebar
   - You should see: `users`, `movies`, `reviews`, `watchlist`

#### Option B: Using Migration Script

1. Create `backend/.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
   NODE_ENV=development
   ```

2. Run migration:
   ```bash
   cd backend
   node ../database/migrate.js
   ```

### 5. Configure Backend

1. In your Render backend service, go to **Environment** tab
2. Set `DATABASE_URL` to your Supabase connection string (with password replaced)
3. Save changes - Render will automatically redeploy

### 6. Test Connection

1. Check your Render backend logs
2. You should see: "Connected to PostgreSQL database"
3. If you see connection errors, verify:
   - Password is correct in connection string
   - Connection string format is correct
   - Supabase project is active (not paused)

## Verifying Setup

### Check Tables in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You should see 4 tables:
   - `users`
   - `movies`
   - `reviews`
   - `watchlist`

### Test Your Application

1. Visit your deployed frontend
2. Try registering a new user
3. Add a movie
4. Write a review
5. Check Supabase **Table Editor** to see the data

## Monitoring Usage

### Check Database Size

1. Go to **Settings** → **Database**
2. View **Database size** (should be under 500 MB on free tier)

### Check Bandwidth

1. Go to **Settings** → **Usage**
2. Monitor **Bandwidth** (2 GB/month on free tier)

### View Data

1. Go to **Table Editor**
2. Click on any table to view data
3. Use filters and search to find specific records

## Troubleshooting

### Connection Errors

**Error: "password authentication failed"**
- Verify password in connection string matches your Supabase project password
- Check for typos or extra spaces

**Error: "SSL connection required"**
- Supabase requires SSL - the code already handles this
- Verify `NODE_ENV=production` is set

**Error: "connection timeout"**
- Check if Supabase project is paused (free tier pauses after 1 week of inactivity)
- Go to Supabase dashboard and click "Restore" if paused

### Migration Issues

**Tables not created:**
- Check SQL Editor for error messages
- Verify you copied the entire `schema.sql` file
- Try running SQL statements one at a time

**Permission errors:**
- Supabase free tier has full permissions
- If issues persist, check Supabase project status

## Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited
- **Storage**: 1 GB (if you add file uploads later)

## Upgrading (If Needed)

If you exceed free tier limits:
1. Go to **Settings** → **Billing**
2. Choose a paid plan
3. No code changes needed - just update billing

## Security Notes

- Never commit your connection string to Git
- Use environment variables for all secrets
- Supabase connection strings include passwords - keep them secure
- Enable Row Level Security (RLS) in Supabase if you want additional security (optional)

## Additional Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Supabase Discord: https://discord.supabase.com

