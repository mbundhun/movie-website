# Bottlenecks and Issues Document

This document tracks all bottlenecks and issues discovered during testing and deployment.

## ✅ Resolved Issues

### 1. Frontend Build - Dependency Issue
**Issue**: `react-scripts` version was `^0.0.0` causing build failures
**Status**: ✅ Fixed
**Solution**: Updated to `react-scripts@5.0.1` in package.json
**Impact**: Critical - Would prevent deployment

### 2. Frontend Build - Corrupted node_modules
**Issue**: Missing `resolve` module causing build failures
**Status**: ✅ Fixed
**Solution**: Reinstalled frontend dependencies (`npm install`)
**Impact**: Critical - Would prevent deployment

### 3. ESLint Warning
**Issue**: Missing dependency in useEffect hook
**Status**: ✅ Fixed
**Solution**: Added eslint-disable comment for exhaustive-deps
**Impact**: Low - Warning only, but fixed for clean build

## ⚠️ Potential Bottlenecks (To Test During Deployment)

### Critical (Will Prevent Hosting)

#### 1. Database Connection from Cloud
**Risk**: Medium
**Test**: Deploy backend and check logs for "Connected to PostgreSQL database"
**Mitigation**: 
- Supabase requires SSL (code handles this)
- Cloud-to-cloud connections shouldn't have firewall issues
- Verify DATABASE_URL is correct in environment variables

#### 2. Environment Variables Not Set
**Risk**: High
**Test**: Verify all required variables are set in hosting dashboard
**Required Variables**:
- Backend: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `PORT`
- Frontend: `REACT_APP_API_URL`
**Mitigation**: Use deployment checklist

#### 3. CORS Configuration
**Risk**: Medium
**Test**: Frontend should be able to call backend API
**Mitigation**: Backend CORS is configured to allow all origins (`app.use(cors())`)

#### 4. Port Configuration
**Risk**: Low
**Test**: Backend should read PORT from environment
**Mitigation**: Code uses `process.env.PORT || 5000` (Render provides PORT)

### High Impact (Will Break Features)

#### 5. React Environment Variables at Build Time
**Risk**: High
**Issue**: `REACT_APP_API_URL` must be set BEFORE build
**Test**: If changed after build, frontend won't use new value
**Mitigation**: Set environment variable before deploying

#### 6. JWT Secret Not Set
**Risk**: High
**Issue**: Authentication won't work without JWT_SECRET
**Test**: Try to register/login
**Mitigation**: Generate and set JWT_SECRET in backend environment

#### 7. Database Migration Not Run
**Risk**: High
**Issue**: Tables don't exist, all queries fail
**Status**: ✅ Already completed via Supabase SQL Editor
**Mitigation**: Verify tables exist in Supabase Table Editor

### Medium Impact (Will Cause Issues)

#### 8. Free Tier Limitations

**Vercel Serverless Functions (Backend)**:
- 100GB bandwidth/month (free tier)
- 100 hours execution time/month (free tier)
- Auto-scales based on usage
- No forced spin-down
- Free forever (Hobby plan)
**Impact**: Low - Free tier usually sufficient for personal movie website

**Vercel Frontend**:
- Function timeout: 10 seconds (not applicable for static site)
- Build time limits: Usually sufficient
- 100GB bandwidth/month
**Impact**: Low - Static site has no timeout issues

#### 9. Build Time Limits
**Risk**: Low
**Issue**: Very large builds might timeout
**Test**: Frontend build completes in reasonable time
**Mitigation**: Current build is small (~140KB gzipped)

#### 10. Node.js Version Compatibility
**Risk**: Low
**Issue**: Different Node.js versions might cause issues
**Test**: Verify hosting platform uses Node 16+
**Mitigation**: package.json specifies `"node": ">=16.0.0"`

### Low Impact (Minor Issues)

#### 11. Cold Start Delays
**Impact**: 30-second delay after inactivity on Render free tier
**Acceptable**: Yes, for personal projects

#### 12. Dependency Vulnerabilities
**Impact**: 9 vulnerabilities found in frontend (3 moderate, 6 high)
**Action**: Can run `npm audit fix` but may cause breaking changes
**Priority**: Low - doesn't prevent deployment

## Testing Checklist

Use this during deployment:

- [ ] Backend deploys successfully
- [ ] Backend health endpoint works
- [ ] Backend connects to database (check logs)
- [ ] Frontend builds successfully
- [ ] Frontend deploys successfully
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] API calls work (check Network tab)
- [ ] Can register account
- [ ] Can login
- [ ] Can add movie
- [ ] Can write review
- [ ] Can view watchlist

## Known Workarounds

1. **Local Database Connection**: Use Supabase SQL Editor instead of migration script (already working)
2. **Frontend Build**: Reinstall dependencies if build fails
3. **Environment Variables**: Always set REACT_APP_API_URL before building frontend

## Recommendations

1. **Deploy backend first** - Verify it works before deploying frontend
2. **Test health endpoint** - Quick way to verify backend is running
3. **Check logs** - Both Render and Vercel provide detailed logs
4. **Test incrementally** - Deploy, test one feature, fix, repeat

