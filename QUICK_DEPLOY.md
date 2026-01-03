# Quick Deployment Guide (All Free Forever)

Fastest way to get your website hosted and working using only free services that never expire.

## Prerequisites

✅ Database already set up on Supabase (completed)
✅ Code ready (backend and frontend)
✅ GitHub account
✅ Vercel account (free - for both frontend and backend)

## Step 1: Deploy Everything to Vercel (5 minutes)

**Why Vercel?**
- ✅ **Free forever** (Hobby plan, no expiration)
- ✅ Hosts both frontend AND backend in one place
- ✅ Automatic deployments from GitHub
- ✅ Fast global CDN
- ✅ Serverless functions for backend (free tier: 100GB bandwidth/month)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub (free)
3. **Add New** → **Project**
4. **Import** your GitHub repository
5. **Vercel will auto-detect** the configuration from `vercel.json`

6. **Environment Variables** (click "Environment Variables"):
   ```
   DATABASE_URL = postgresql://postgres:966NnnlAdJ16ouU3@db.ghxendkjzbohydqmplkd.supabase.co:5432/postgres
   JWT_SECRET = [generate with: openssl rand -hex 32 or use online generator]
   NODE_ENV = production
   ```
   
   ⚠️ **IMPORTANT**: 
   - Set these BEFORE clicking Deploy!
   - These are for the backend API (serverless function)
   - Frontend will automatically use the same domain for API calls

7. **Deploy**
8. **Wait** for build (~3-5 minutes)
   - Frontend builds first
   - Backend API builds as serverless function
9. **Visit** your Vercel URL

## Step 2: Configure Frontend API URL

After deployment, the frontend needs to know the API URL:

1. **Go to Vercel dashboard** → Your project → **Settings** → **Environment Variables**
2. **Add** (if not already set):
   ```
   REACT_APP_API_URL = https://your-project.vercel.app/api
   ```
   Replace `your-project` with your actual Vercel project name.

3. **Redeploy** the frontend (Vercel will auto-redeploy when you save)

**Note**: If you don't set `REACT_APP_API_URL`, the frontend will default to `http://localhost:5000/api` for local development, but in production it will use the same Vercel domain automatically.

## Step 3: Test Everything

1. **Visit frontend URL**: `https://your-project.vercel.app`
2. **Test API health**: `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`
3. **Open browser console** (F12)
4. **Check for errors**
5. **Test features**:
   - Browse as visitor
   - Register account
   - Add movie
   - Write review

## Troubleshooting

### Backend Issues

**Health endpoint doesn't work**:
- Check Vercel Function logs (Project → Functions → View logs)
- Verify environment variables are set correctly
- Check that `api/index.js` exists and exports Express app
- Verify `vercel.json` configuration

**Database connection fails**:
- Verify DATABASE_URL is correct (copy from Supabase)
- Check Supabase project is active
- Check Vercel Function logs for connection errors
- Ensure SSL is enabled (Supabase requires SSL)

### Frontend Issues

**Build fails**:
- Check Vercel build logs
- Verify `frontend/package.json` is correct
- Check for compilation errors

**API calls fail**:
- Verify REACT_APP_API_URL is set (or frontend uses relative URLs)
- Check backend API is deployed (test `/api/health`)
- Check browser Network tab for failed requests
- Verify CORS is configured (should allow all origins)

**CORS errors**:
- Backend CORS is configured to allow all origins
- If issues persist, check Vercel Function logs

## Architecture

When deployed to Vercel:
- **Frontend**: Static site served from CDN (`/`)
- **Backend**: Serverless function at `/api/*` (handled by `api/index.js`)
- **Database**: Supabase (external, free forever)

All requests to `/api/*` are automatically routed to the serverless function.

## Next Steps

After successful deployment:
- Test all features
- Monitor Vercel usage (usually well within free tier limits)
- Consider custom domain (optional)
- Set up monitoring (optional)

## Free Tier Limits (Vercel Hobby Plan)

- **100GB bandwidth/month** - Usually sufficient for personal projects
- **100 hours execution time/month** - More than enough for serverless functions
- **Unlimited deployments** - Deploy as much as you want
- **No expiration** - Free forever

For a personal movie review website, these limits are typically more than sufficient.
