const express = require('express');
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get statistics (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Total movies
    const moviesCount = await pool.query('SELECT COUNT(*) as count FROM movies');
    const totalMovies = parseInt(moviesCount.rows[0].count);
    
    // Total reviews
    const reviewsCount = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const totalReviews = parseInt(reviewsCount.rows[0].count);
    
    // Average rating
    const avgRating = await pool.query('SELECT AVG(rating) as avg FROM reviews WHERE rating IS NOT NULL');
    const averageRating = parseFloat(avgRating.rows[0].avg || 0).toFixed(2);
    
    // Ratings distribution
    const ratingsDist = await pool.query(
      `SELECT rating, COUNT(*) as count 
       FROM reviews 
       WHERE rating IS NOT NULL 
       GROUP BY rating 
       ORDER BY rating`
    );
    
    // Genre breakdown
    const genreBreakdown = await pool.query(
      `SELECT genre, COUNT(*) as count 
       FROM movies 
       WHERE genre IS NOT NULL AND genre != ''
       GROUP BY genre 
       ORDER BY count DESC 
       LIMIT 10`
    );
    
    // Movies per year
    const moviesPerYear = await pool.query(
      `SELECT year, COUNT(*) as count 
       FROM movies 
       WHERE year IS NOT NULL 
       GROUP BY year 
       ORDER BY year DESC 
       LIMIT 20`
    );
    
    // Recent reviews
    const recentReviews = await pool.query(
      `SELECT r.*, 
              m.title as movie_title, m.year as movie_year, m.poster_url as movie_poster,
              u.username as user_username
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 10`
    );
    
    // If authenticated, get user-specific stats
    let userStats = null;
    if (req.user) {
      const userReviewsCount = await pool.query(
        'SELECT COUNT(*) as count FROM reviews WHERE user_id = $1',
        [req.user.id]
      );
      
      const userAvgRating = await pool.query(
        'SELECT AVG(rating) as avg FROM reviews WHERE user_id = $1 AND rating IS NOT NULL',
        [req.user.id]
      );
      
      const userWatchlistCount = await pool.query(
        'SELECT COUNT(*) as count FROM watchlist WHERE user_id = $1',
        [req.user.id]
      );
      
      userStats = {
        reviewsCount: parseInt(userReviewsCount.rows[0].count),
        averageRating: parseFloat(userAvgRating.rows[0].avg || 0).toFixed(2),
        watchlistCount: parseInt(userWatchlistCount.rows[0].count)
      };
    }
    
    res.json({
      totalMovies,
      totalReviews,
      averageRating: parseFloat(averageRating),
      ratingsDistribution: ratingsDist.rows.map(r => ({
        rating: parseInt(r.rating),
        count: parseInt(r.count)
      })),
      genreBreakdown: genreBreakdown.rows.map(g => ({
        genre: g.genre,
        count: parseInt(g.count)
      })),
      moviesPerYear: moviesPerYear.rows.map(m => ({
        year: parseInt(m.year),
        count: parseInt(m.count)
      })),
      recentReviews: recentReviews.rows,
      userStats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics',
      error: error.message,
      details: process.env.NODE_ENV === 'development' || process.env.VERCEL ? error.stack : undefined
    });
  }
});

module.exports = router;

