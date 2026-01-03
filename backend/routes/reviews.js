const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all reviews with optional filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { movie_id, user_id, rating_min, rating_max, tag, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT r.*, 
             m.title as movie_title, m.year as movie_year, m.poster_url as movie_poster,
             u.username as user_username
      FROM reviews r
      JOIN movies m ON r.movie_id = m.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (movie_id) {
      paramCount++;
      query += ` AND r.movie_id = $${paramCount}`;
      params.push(parseInt(movie_id));
    }
    
    if (user_id) {
      paramCount++;
      query += ` AND r.user_id = $${paramCount}`;
      params.push(parseInt(user_id));
    }
    
    if (rating_min) {
      paramCount++;
      query += ` AND r.rating >= $${paramCount}`;
      params.push(parseInt(rating_min));
    }
    
    if (rating_max) {
      paramCount++;
      query += ` AND r.rating <= $${paramCount}`;
      params.push(parseInt(rating_max));
    }
    
    if (tag) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(r.tags)`;
      params.push(tag);
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      reviews: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get single review by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT r.*, 
              m.title as movie_title, m.year as movie_year, m.poster_url as movie_poster,
              u.username as user_username
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Error fetching review' });
  }
});

// Create review (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { movie_id, rating, review_text, watched_date, tags } = req.body;
    
    if (!movie_id) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }
    
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 1 and 10' });
    }
    
    // Check if movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [movie_id]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Check if user already reviewed this movie
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE movie_id = $1 AND user_id = $2',
      [movie_id, req.user.id]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }
    
    const result = await pool.query(
      `INSERT INTO reviews (movie_id, user_id, rating, review_text, watched_date, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        movie_id,
        req.user.id,
        rating,
        review_text || null,
        watched_date || null,
        tags && Array.isArray(tags) ? tags : null
      ]
    );
    
    // Get full review with movie and user info
    const fullReview = await pool.query(
      `SELECT r.*, 
              m.title as movie_title, m.year as movie_year, m.poster_url as movie_poster,
              u.username as user_username
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(fullReview.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Update review (authenticated only, own reviews only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text, watched_date, tags } = req.body;
    
    // Check if review exists and belongs to user
    const reviewCheck = await pool.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [id]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (reviewCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }
    
    const result = await pool.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating),
           review_text = COALESCE($2, review_text),
           watched_date = COALESCE($3, watched_date),
           tags = COALESCE($4, tags)
       WHERE id = $5
       RETURNING *`,
      [rating, review_text, watched_date, tags && Array.isArray(tags) ? tags : null, id]
    );
    
    // Get full review with movie and user info
    const fullReview = await pool.query(
      `SELECT r.*, 
              m.title as movie_title, m.year as movie_year, m.poster_url as movie_poster,
              u.username as user_username
       FROM reviews r
       JOIN movies m ON r.movie_id = m.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    res.json(fullReview.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

// Delete review (authenticated only, own reviews only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review exists and belongs to user
    const reviewCheck = await pool.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [id]
    );
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (reviewCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }
    
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;

