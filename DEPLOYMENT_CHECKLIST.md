# Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## Prerequisites

- [ ] GitHub repository created and code pushed
- [ ] Supabase account created
- [ ] Supabase database project created
- [ ] Database password saved securely
- [ ] Vercel account created (for both frontend and backend)

## Database Setup

- [ ] Supabase project created
- [ ] Database connection string copied
- [ ] Database migration completed (using Supabase SQL Editor or migration script)
- [ ] Tables verified in Supabase Table Editor:
  - [ ] users
  - [ ] movies
  - [ ] reviews
  - [ ] watchlist
  - [ ] cast_table
  - [ ] movie_cast
  - [ ] screenwriters
  - [ ] movie_screenwriters

## Backend Deployment (Vercel Serverless Functions)

- [ ] Vercel project created from GitHub repository
- [ ] Environment variables set in Vercel:
  - [ ] `DATABASE_URL` = (Supabase connection string)
  - [ ] `JWT_SECRET` = (generated secret)
  - [ ] `NODE_ENV` = `production`
- [ ] `api/index.js` exists and exports Express app
- [ ] `vercel.json` configuration verified
- [ ] Deployment successful
- [ ] Health endpoint works: `https://your-project.vercel.app/api/health`
- [ ] Logs show "Connected to PostgreSQL database" (check Vercel Functions logs)
- [ ] Test API endpoint: `GET /api/movies` returns data

## Frontend Deployment (Vercel)

- [ ] Frontend builds successfully (automatic with Vercel)
- [ ] Environment variable set (if needed):
  - [ ] `REACT_APP_API_URL` = `https://your-project.vercel.app/api` (or just `/api` for same domain)
- [ ] Deployment successful
- [ ] Frontend URL accessible
- [ ] Frontend loads without errors

## Integration Testing

- [ ] Frontend can connect to backend API
- [ ] Health endpoint accessible from frontend
- [ ] CORS working correctly (no CORS errors in browser console)
- [ ] Visitor mode works (browsing without login)
- [ ] User registration works
- [ ] User login works
- [ ] Adding movies works (authenticated users)
- [ ] Writing reviews works (authenticated users)
- [ ] Watchlist functionality works
- [ ] Statistics page loads
- [ ] Search and filter features work

## Final Verification

- [ ] All features tested and working
- [ ] No console errors in browser
- [ ] No errors in Vercel Function logs
- [ ] Database connections stable
- [ ] Performance acceptable

## Troubleshooting Checklist

1. **Backend not responding**:
   - Check Vercel Function logs
   - Verify environment variables are set
   - Check that `api/index.js` exists
   - Verify `vercel.json` configuration

2. **Database connection fails**:
   - Verify DATABASE_URL is correct
   - Check Supabase project is active
   - Check Vercel Function logs for connection errors
   - Verify SSL is enabled (Supabase requires SSL)

3. **Frontend build fails**:
   - Check Vercel build logs
   - Verify `frontend/package.json` is correct
   - Check for compilation errors

4. **API calls fail**:
   - Verify REACT_APP_API_URL is set correctly (or use relative URLs)
   - Check backend API is deployed (test `/api/health`)
   - Check browser Network tab for failed requests
   - Verify CORS is configured

5. **Environment variables not working**:
   - Frontend: Must have REACT_APP_ prefix
   - Frontend: Must be set BEFORE build
   - Backend: Set in Vercel Environment Variables
   - Redeploy after setting environment variables
