# Free Hosting Options (No Expiration)

This document lists all free hosting options that don't require payment after a trial period.

## ✅ Recommended Setup (All Free Forever)

### Backend: Vercel Serverless Functions
- **URL**: https://vercel.com
- **Free Tier**: Hobby plan (free forever)
- **Expiration**: Never expires
- **Limits**: 100GB bandwidth/month, 100 hours execution time/month
- **Pros**: Same platform as frontend, free forever, excellent performance
- **Cons**: Requires Express app to be converted to serverless function (already done)

### Frontend: Vercel
- **URL**: https://vercel.com
- **Free Tier**: Hobby plan (free forever)
- **Expiration**: Never expires
- **Limits**: 100GB bandwidth/month, unlimited deployments
- **Pros**: Excellent for React, fast CDN, automatic deployments
- **Cons**: None for personal projects

### Database: Supabase
- **URL**: https://supabase.com
- **Free Tier**: Free plan (free forever)
- **Expiration**: Never expires
- **Limits**: 500 MB storage, 2 GB bandwidth/month
- **Pros**: PostgreSQL, automatic backups, SSL included
- **Cons**: None for personal projects

## Backend Options

### Vercel Serverless Functions (Recommended)
- **URL**: https://vercel.com
- **Free Tier**: Hobby plan (free forever)
- **Expiration**: Never expires
- **Limits**: 100GB bandwidth/month, 100 hours execution time/month
- **Pros**: Same platform as frontend, free forever, excellent performance, easy deployment
- **Cons**: Requires Express app structure (already configured in this project)
- **Best For**: Projects using Vercel for frontend (recommended)

### Railway (Alternative - Credit-Based)
- **URL**: https://railway.app
- **Free Tier**: $5/month credit
- **Expiration**: Credit resets monthly
- **Limits**: Credit-based, usually sufficient for personal projects
- **Pros**: Easy setup, GitHub integration, auto-detection
- **Cons**: Credit may run out if usage is high (unlikely for personal movie website)
- **Best For**: Alternative if you prefer separate backend hosting

## Alternative Frontend Options

### Option 1: Netlify (Also Free Forever)
- **URL**: https://netlify.com
- **Free Tier**: Free plan (free forever)
- **Expiration**: Never expires
- **Limits**: 100GB bandwidth/month, 300 build minutes/month
- **Pros**: Great for static sites, easy deployment
- **Cons**: Slightly slower than Vercel for React
- **Best For**: Alternative to Vercel

### Option 2: Cloudflare Pages (Also Free Forever)
- **URL**: https://pages.cloudflare.com
- **Free Tier**: Free plan (free forever)
- **Expiration**: Never expires
- **Limits**: Unlimited bandwidth, unlimited requests
- **Pros**: Excellent performance, unlimited bandwidth
- **Cons**: Less popular, fewer tutorials
- **Best For**: Maximum performance

## Comparison Table

| Service | Type | Free Tier | Expiration | Best For |
|---------|------|-----------|------------|----------|
| **Vercel** | Backend + Frontend | Hobby plan | Never | Full-stack apps |
| **Railway** | Backend | $5/month credit | Resets monthly | Alternative backend |
| **Netlify** | Frontend | Free plan | Never | Static sites |
| **Supabase** | Database | Free plan | Never | PostgreSQL |

## Recommended Combination

**Best Overall (All Free Forever)**:
- Backend: Vercel Serverless Functions (free forever)
- Frontend: Vercel (free forever)
- Database: Supabase (free forever)

**Alternative (If You Prefer Separate Backend)**:
- Backend: Railway ($5/month credit, usually sufficient)
- Frontend: Vercel (free forever)
- Database: Supabase (free forever)

## Cost Summary

**Recommended Setup**:
- Vercel: Free tier never expires (both frontend and backend)
- Supabase: Free tier never expires

**Total Monthly Cost: $0** (all services free forever)

## Notes

- **Vercel** hosts both frontend and backend, simplifying deployment
- Vercel free tier provides 100GB bandwidth/month (usually sufficient)
- Vercel free tier provides 100 hours execution time/month (more than enough)
- **Monitor usage** in Vercel dashboard (usually well within limits)
- All services (Vercel, Supabase) are free forever
- No service requires payment after a trial period (unlike Render)
- For a personal movie review website, Vercel free tier is typically more than sufficient

