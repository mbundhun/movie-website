# Personal Movie Review Website

A full-stack movie review website where you can review movies you've watched and maintain a watchlist of movies to watch in the future.

## Features

- **Visitor Mode**: Browse all movies, reviews, and statistics without authentication
- **User Authentication**: Optional login to write reviews, add movies, and manage personal watchlist
- **Movie Reviews**: Rate movies (1-10), write reviews, add tags, and track watched dates
- **Watchlist**: Keep track of movies you want to watch
- **Statistics Dashboard**: View charts and statistics about your movie collection
- **Search & Filter**: Search movies by title and filter by rating, year, genre, and tags
- **Cast Management**: Add multiple cast members per movie with character names and roles
- **Screenwriters**: Track multiple screenwriters per movie

## Technology Stack

- **Frontend**: React, React Router, Axios, Chart.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Railway/Fly.io (backend), Vercel (frontend) - All free forever

## Project Structure

```
movie-website/
├── frontend/          # React application
├── backend/           # Node.js/Express API
├── database/          # Database migration scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Note**: For production, use Supabase connection string. See `SUPABASE_SETUP.md` for details.

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Running Locally

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is configured for deployment with Supabase as the database (free tier, no expiration).

**Recommended Hosting (All Free Forever)**:
- **Backend**: Vercel Serverless Functions (free tier, never expires) - https://vercel.com
- **Frontend**: Vercel (free tier, never expires) - https://vercel.com  
- **Database**: Supabase (free tier, never expires) - https://supabase.com

**Note**: All services are free forever. Vercel hosts both frontend and backend on the same platform.

**Quick Deployment**: See `QUICK_DEPLOY.md` for fastest deployment (8 minutes)

**Detailed Guides**:
- `QUICK_DEPLOY.md` - Fastest deployment (5 minutes, all free forever)
- `DEPLOYMENT.md` - Complete deployment instructions
- `FREE_HOSTING_OPTIONS.md` - All free hosting options compared
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `HOSTING_TEST_GUIDE.md` - Testing guide
- `SUPABASE_SETUP.md` - Supabase database setup
- `BOTTLENECKS_FOUND.md` - Known issues and solutions
- `database/CAST_AND_SCREENWRITERS.md` - Cast and screenwriters API

**Deployment Config Files**:
- `vercel.json` - Vercel configuration (frontend + backend)
- `api/index.js` - Vercel serverless function (backend API)
- `netlify.toml` - Netlify configuration (alternative frontend)

