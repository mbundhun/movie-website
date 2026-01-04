const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get watchlist (user-specific if authenticated, public if visitor)
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = `
      SELECT w.*, 
             m.title as movie_title, m.year as movie_year, m.director, m.genre, 
             m.poster_url as movie_poster, m.imdb_id,
             u.username as user_username
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      LEFT JOIN users u ON w.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    // If authenticated, show only user's watchlist; if visitor, show all
    if (req.user) {
      paramCount++;
      query += ` AND w.user_id = $${paramCount}`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY w.added_date DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      watchlist: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Error fetching watchlist' });
  }
});

// Add to watchlist (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { movie_id, notes, priority } = req.body;
    
    if (!movie_id) {
      return res.status(400).json({ message: 'Movie ID is required' });
    }
    
    // Check if movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [movie_id]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Check if already in watchlist
    const existing = await pool.query(
      'SELECT id FROM watchlist WHERE movie_id = $1 AND user_id = $2',
      [movie_id, req.user.id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Movie is already in your watchlist' });
    }
    
    const result = await pool.query(
      `INSERT INTO watchlist (movie_id, user_id, notes, priority)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [movie_id, req.user.id, notes || null, priority || 0]
    );
    
    // Get full watchlist item with movie info
    const fullItem = await pool.query(
      `SELECT w.*, 
              m.title as movie_title, m.year as movie_year, m.director, m.genre,
              m.poster_url as movie_poster, m.imdb_id,
              u.username as user_username
       FROM watchlist w
       JOIN movies m ON w.movie_id = m.id
       LEFT JOIN users u ON w.user_id = u.id
       WHERE w.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(fullItem.rows[0]);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: 'Error adding to watchlist' });
  }
});

// Update watchlist item (authenticated only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, priority } = req.body;
    
    // Check if item exists and belongs to user
    const itemCheck = await pool.query(
      'SELECT user_id FROM watchlist WHERE id = $1',
      [id]
    );
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    if (itemCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own watchlist items' });
    }
    
    const result = await pool.query(
      `UPDATE watchlist 
       SET notes = COALESCE($1, notes),
           priority = COALESCE($2, priority)
       WHERE id = $3
       RETURNING *`,
      [notes, priority, id]
    );
    
    // Get full watchlist item with movie info
    const fullItem = await pool.query(
      `SELECT w.*, 
              m.title as movie_title, m.year as movie_year, m.director, m.genre,
              m.poster_url as movie_poster, m.imdb_id,
              u.username as user_username
       FROM watchlist w
       JOIN movies m ON w.movie_id = m.id
       LEFT JOIN users u ON w.user_id = u.id
       WHERE w.id = $1`,
      [id]
    );
    
    res.json(fullItem.rows[0]);
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ message: 'Error updating watchlist' });
  }
});

// Remove from watchlist by item ID (authenticated only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists and belongs to user
    const itemCheck = await pool.query(
      'SELECT user_id FROM watchlist WHERE id = $1',
      [id]
    );
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    if (itemCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own watchlist items' });
    }
    
    await pool.query('DELETE FROM watchlist WHERE id = $1', [id]);
    
    res.json({ message: 'Removed from watchlist successfully' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Error removing from watchlist' });
  }
});

// Remove from watchlist by movie ID (authenticated only)
router.delete('/movie/:movieId', requireAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM watchlist WHERE movie_id = $1 AND user_id = $2 RETURNING *',
      [movieId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found in watchlist' });
    }
    
    res.json({ message: 'Removed from watchlist successfully' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Error removing from watchlist' });
  }
});

module.exports = router;

