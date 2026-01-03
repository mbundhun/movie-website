const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all screenwriters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM screenwriters WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json({ screenwriters: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching screenwriters:', error);
    res.status(500).json({ message: 'Error fetching screenwriters' });
  }
});

// Get single screenwriter by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM screenwriters WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Screenwriter not found' });
    }
    
    // Get movies this screenwriter worked on
    const moviesResult = await pool.query(
      `SELECT m.*, ms.screenwriter_order
       FROM movies m
       JOIN movie_screenwriters ms ON m.id = ms.movie_id
       WHERE ms.screenwriter_id = $1
       ORDER BY ms.screenwriter_order, m.year DESC`,
      [id]
    );
    
    res.json({
      ...result.rows[0],
      movies: moviesResult.rows
    });
  } catch (error) {
    console.error('Error fetching screenwriter:', error);
    res.status(500).json({ message: 'Error fetching screenwriter' });
  }
});

// Get screenwriters for a specific movie
router.get('/movie/:movieId', optionalAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await pool.query(
      `SELECT s.*, ms.screenwriter_order
       FROM screenwriters s
       JOIN movie_screenwriters ms ON s.id = ms.screenwriter_id
       WHERE ms.movie_id = $1
       ORDER BY ms.screenwriter_order, s.name`,
      [movieId]
    );
    
    res.json({ screenwriters: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching movie screenwriters:', error);
    res.status(500).json({ message: 'Error fetching movie screenwriters' });
  }
});

// Add new screenwriter (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO screenwriters (name, bio)
       VALUES ($1, $2)
       RETURNING *`,
      [name, bio || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating screenwriter:', error);
    res.status(500).json({ message: 'Error creating screenwriter' });
  }
});

// Add screenwriter to movie (authenticated only)
router.post('/movie/:movieId', requireAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { screenwriter_id, screenwriter_order } = req.body;
    
    if (!screenwriter_id) {
      return res.status(400).json({ message: 'Screenwriter ID is required' });
    }
    
    // Check if movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [movieId]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Check if screenwriter exists
    const screenwriterCheck = await pool.query('SELECT id FROM screenwriters WHERE id = $1', [screenwriter_id]);
    if (screenwriterCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Screenwriter not found' });
    }
    
    const result = await pool.query(
      `INSERT INTO movie_screenwriters (movie_id, screenwriter_id, screenwriter_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [movieId, screenwriter_id, screenwriter_order || 0]
    );
    
    // Get full screenwriter info
    const fullResult = await pool.query(
      `SELECT s.*, ms.screenwriter_order
       FROM screenwriters s
       JOIN movie_screenwriters ms ON s.id = ms.screenwriter_id
       WHERE ms.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'Screenwriter already added to this movie' });
    }
    console.error('Error adding screenwriter to movie:', error);
    res.status(500).json({ message: 'Error adding screenwriter to movie' });
  }
});

// Remove screenwriter from movie (authenticated only)
router.delete('/movie/:movieId/:screenwriterId', requireAuth, async (req, res) => {
  try {
    const { movieId, screenwriterId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM movie_screenwriters WHERE movie_id = $1 AND screenwriter_id = $2 RETURNING *',
      [movieId, screenwriterId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Screenwriter not found in this movie' });
    }
    
    res.json({ message: 'Screenwriter removed from movie successfully' });
  } catch (error) {
    console.error('Error removing screenwriter from movie:', error);
    res.status(500).json({ message: 'Error removing screenwriter from movie' });
  }
});

module.exports = router;

