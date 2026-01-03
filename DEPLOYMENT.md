# Deployment Guide - Vercel (All Free Forever)

This guide will help you deploy the Movie Review Website to Vercel (both frontend and backend) using Supabase for the database (free tier with no expiration).

## Quick Start

For the fastest deployment, see `QUICK_DEPLOY.md` - it takes about 5 minutes total.

## Prerequisites

1. A GitHub account
2. A Supabase account (sign up at https://supabase.com) - **Free tier never expires**
3. A Vercel account (for both frontend and backend) - https://vercel.com - **Free tier never expires**
4. Your code pushed to a GitHub repository

## Why This Hosting Setup? (All Free Forever)

- **Backend (Vercel Serverless Functions)**: Free tier never expires, 100GB bandwidth/month, 100 hours execution time/month
- **Frontend (Vercel Static Site)**: Free tier never expires, excellent for React, fast CDN
- **Database (Supabase)**: Free tier never expires, already set up
- **Benefits**: All services free forever, single platform for frontend and backend, no firewall issues, best performance

## Step 1: Create Supabase Database (Free, No Expiration)

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Configure your project:
   - **Name**: `movie-website` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (500 MB database, 2 GB bandwidth - no expiration)
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be set up
6. Once ready, go to **Settings** → **Database**
7. Scroll down to find **Connection string** section
8. Copy the **URI** connection string
   - Replace `[YOUR-PASSWORD]` with the password you created
   - This is your `DATABASE_URL` for the backend

## Step 2: Run Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the SQL
5. Verify tables were created by checking the **Table Editor** in the left sidebar

### Option B: Using Migration Script Locally

1. Create a `.env` file in the `backend` folder:
   ```
   DATABASE_URL=your-supabase-connection-string-here
   NODE_ENV=development
   ```
2. Run the migration:
   ```bash
   node database/migrate.js
   ```

## Step 3: Deploy to Vercel (Frontend + Backend)

### Step 3.1: Connect Repository

1. Go to https://vercel.com and sign up/login with GitHub
2. Click **"Add New"** → **"Project"**
3. **Import** your GitHub repository
4. Vercel will auto-detect configuration from `vercel.json`

### Step 3.2: Configure Environment Variables

**Before deploying**, set environment variables:

1. In the Vercel project setup, go to **"Environment Variables"**
2. Add these variables:

   ```
   DATABASE_URL = postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET = [generate with: openssl rand -hex 32 or online generator]
   NODE_ENV = production
   REACT_APP_API_URL = https://your-project.vercel.app/api
   ```

   ⚠️ **IMPORTANT**: 
   - Set `REACT_APP_API_URL` to your Vercel project URL + `/api`
   - You can update this after deployment if needed
   - For production, you can use relative URLs (just `/api`) if frontend and backend are on same domain

3. **Generate JWT_SECRET**:
   - Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
   - Or use online generator: https://generate-secret.vercel.app/32

### Step 3.3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
   - Frontend builds first
   - Backend API builds as serverless function
3. Your site will be live at `https://your-project.vercel.app`

### Step 3.4: Verify Deployment

1. **Test Frontend**: Visit `https://your-project.vercel.app`
2. **Test Backend API**: Visit `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`
3. **Check Logs**: Go to Vercel dashboard → Your project → **Functions** → View logs

## Step 4: Update Frontend API URL (If Needed)

If you didn't set `REACT_APP_API_URL` during deployment:

1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add or update:
   ```
   REACT_APP_API_URL = https://your-project.vercel.app/api
   ```
3. **Redeploy** (Vercel will auto-redeploy when you save)

**Note**: If frontend and backend are on the same Vercel domain, you can use relative URLs (`/api`) instead of absolute URLs.

## Step 5: Test Your Deployment

1. Visit your frontend URL
2. Test visitor mode (should work without login)
3. Register a new account
4. Try adding a movie and writing a review

## Troubleshooting

### Backend Issues
- Check logs in Vercel dashboard → Functions → View logs
- Verify DATABASE_URL is correct
- Ensure JWT_SECRET is set
- Check that `api/index.js` exists and exports Express app
- Verify `vercel.json` configuration

### Frontend Issues
- Verify REACT_APP_API_URL points to backend + `/api` (or use relative URLs)
- Check browser console for CORS errors
- Ensure backend CORS is configured correctly
- Check Vercel build logs for compilation errors

### Database Issues
- Verify database migration ran successfully in Supabase SQL Editor
- Check Supabase connection string format (should include password)
- Ensure tables exist (check Supabase Table Editor: users, movies, reviews, watchlist)
- Verify SSL is enabled (Supabase requires SSL connections)
- Check Supabase project status in dashboard (should be "Active")

## Environment Variables Summary

### Backend (Serverless Function)
- `DATABASE_URL` - PostgreSQL connection string from Supabase
- `JWT_SECRET` - Secret for JWT tokens
- `NODE_ENV` - Set to `production`

### Frontend
- `REACT_APP_API_URL` - Backend API URL (e.g., `https://your-project.vercel.app/api` or just `/api` for same domain)

## Free Tier Details (All Services)

### Vercel (Frontend + Backend)
- **Free tier never expires**
- **100GB bandwidth/month** - Usually sufficient for personal projects
- **100 hours execution time/month** - More than enough for serverless functions
- **Unlimited deployments** - Deploy as much as you want
- **Automatic HTTPS** - Included
- **Global CDN** - Fast performance worldwide

### Supabase (Database)
- **Free tier never expires**
- 500 MB database storage
- 2 GB bandwidth/month
- Automatic daily backups
- SSL connections included

## Architecture

When deployed to Vercel:
- **Frontend**: Static React app served from CDN at `/`
- **Backend**: Express app as serverless function at `/api/*`
- **Database**: Supabase PostgreSQL (external)

All requests to `/api/*` are automatically routed to the serverless function defined in `api/index.js`.

## Notes

- All services used are free forever (no forced payment)
- Vercel free tier is usually sufficient for personal projects
- Monitor usage in Vercel dashboard (usually well within limits)
- Supabase free tier is permanent (no expiration)
- Database backups are automatic with Supabase
- Both frontend and backend are on the same domain, simplifying CORS and API calls
