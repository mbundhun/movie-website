# Hosting Test Guide

This guide helps you test if the website can be hosted successfully before fixing local development issues.

## Step 1: Test Backend Build Locally

First, verify the backend can build and start:

```bash
cd backend
npm install
npm start
```

Expected output: `Server is running on port 5000`

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response: `{"status":"ok","message":"Server is running"}`

## Step 2: Test Frontend Build Locally

Test if the frontend can build:

```bash
cd frontend
npm install
npm run build
```

Expected: A `build` folder is created with no errors.

## Step 3: Deploy to Vercel (Frontend + Backend)

1. **Push code to GitHub** (if not already done)
   - Create a repository
   - Push all code

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository
   - Vercel will auto-detect configuration from `vercel.json`
   
3. **Set Environment Variables** (before deploying):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (your Supabase connection string)
   - `JWT_SECRET` = (generate with: `openssl rand -hex 32`)
   - `REACT_APP_API_URL` = `https://your-project.vercel.app/api` (or just `/api`)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)

5. **Test Deployment**:
   - Visit: `https://your-project.vercel.app/api/health`
   - Expected: `{"status":"ok","message":"Server is running"}`

6. **Check Logs**:
   - In Vercel dashboard, go to Functions → View logs
   - Look for: "Connected to PostgreSQL database"
   - If you see connection errors, check DATABASE_URL

## Step 4: Test Database Connection from Cloud

Once backend is deployed:

1. **Check Logs**:
   - Check Vercel Function logs for "Connected to PostgreSQL database"
   - If not present, database connection failed

2. **Test API Endpoint with Database**:
   ```bash
   curl https://your-project.vercel.app/api/movies
   ```
   - Expected: `{"movies":[],"count":0}` (empty array is fine)
   - If error, check database connection

3. **Test Database Operations**:
   - Try registering a user: `POST /api/auth/register`
   - Try fetching movies: `GET /api/movies`
   - Check Vercel Function logs for any errors

## Step 5: Test Frontend-Backend Integration

1. **Deploy Frontend** (automatic with Vercel):
   - Frontend builds automatically when you deploy
   - Check Vercel build logs for frontend build status

2. **Test Integration**:
   - Visit: `https://your-project.vercel.app`
   - Open browser console (F12)
   - Check for API call errors
   - Test a feature that requires backend (e.g., register user)

3. **Verify CORS**:
   - Check browser console for CORS errors
   - Backend CORS should allow all origins
   - If CORS errors, check backend CORS configuration

## Step 6: Identify Bottlenecks

Document any issues found:

- [ ] Database connection issues
- [ ] Build problems
- [ ] CORS issues
- [ ] Environment variable issues
- [ ] Free tier limitations
- [ ] Performance issues
- [ ] Other issues

## Next Steps

After successful deployment:
- Test all features
- Monitor Vercel usage (usually well within free tier)
- Document any bottlenecks found
- Fix any issues discovered
