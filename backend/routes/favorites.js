const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites (authenticated only)
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, 
              m.title as movie_title, m.year as movie_year, m.director, 
              m.poster_url as movie_poster, m.imdb_id
       FROM favorites f
       JOIN movies m ON f.movie_id = m.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    
    res.json({
      favorites: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// Check if movie is favorited by user (optional auth - returns false if not authenticated)
router.get('/check/:movieId', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ isFavorite: false });
    }
    
    const { movieId } = req.params;
    const result = await pool.query(
      'SELECT id FROM favorites WHERE movie_id = $1 AND user_id = $2',
      [movieId, req.user.id]
    );
    
    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ message: 'Error checking favorite' });
  }
});

// Add to favorites (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { movie_id } = req.body;
    
    if (!movie_id) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }
    
    // Check if movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [movie_id]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Check if already favorited
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE movie_id = $1 AND user_id = $2',
      [movie_id, req.user.id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Movie is already in your favorites' });
    }
    
    const result = await pool.query(
      `INSERT INTO favorites (movie_id, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [movie_id, req.user.id]
    );
    
    res.status(201).json({ message: 'Added to favorites', favorite: result.rows[0] });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Remove from favorites (authenticated only)
router.delete('/:movieId', requireAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM favorites WHERE movie_id = $1 AND user_id = $2 RETURNING *',
      [movieId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

module.exports = router;

