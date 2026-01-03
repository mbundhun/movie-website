const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all cast members
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM cast_table WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND name ILIKE $1';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json({ cast: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching cast:', error);
    res.status(500).json({ message: 'Error fetching cast' });
  }
});

// Get single cast member by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM cast_table WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cast member not found' });
    }
    
    // Get movies this cast member is in
    const moviesResult = await pool.query(
      `SELECT m.*, mc.character_name, mc.cast_order
       FROM movies m
       JOIN movie_cast mc ON m.id = mc.movie_id
       WHERE mc.cast_id = $1
       ORDER BY mc.cast_order, m.year DESC`,
      [id]
    );
    
    res.json({
      ...result.rows[0],
      movies: moviesResult.rows
    });
  } catch (error) {
    console.error('Error fetching cast member:', error);
    res.status(500).json({ message: 'Error fetching cast member' });
  }
});

// Get cast for a specific movie
router.get('/movie/:movieId', optionalAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, mc.character_name, mc.cast_order
       FROM cast_table c
       JOIN movie_cast mc ON c.id = mc.cast_id
       WHERE mc.movie_id = $1
       ORDER BY mc.cast_order, c.name`,
      [movieId]
    );
    
    res.json({ cast: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching movie cast:', error);
    res.status(500).json({ message: 'Error fetching movie cast' });
  }
});

// Add new cast member (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, bio, profile_image_url } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO cast_table (name, bio, profile_image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, bio || null, profile_image_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cast member:', error);
    res.status(500).json({ message: 'Error creating cast member' });
  }
});

// Add cast member to movie (authenticated only)
router.post('/movie/:movieId', requireAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { cast_id, character_name, cast_order } = req.body;
    
    if (!cast_id) {
      return res.status(400).json({ message: 'Cast ID is required' });
    }
    
    // Check if movie exists
    const movieCheck = await pool.query('SELECT id FROM movies WHERE id = $1', [movieId]);
    if (movieCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Check if cast member exists
    const castCheck = await pool.query('SELECT id FROM cast_table WHERE id = $1', [cast_id]);
    if (castCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Cast member not found' });
    }
    
    const result = await pool.query(
      `INSERT INTO movie_cast (movie_id, cast_id, character_name, cast_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [movieId, cast_id, character_name || null, cast_order || 0]
    );
    
    // Get full cast member info
    const fullResult = await pool.query(
      `SELECT c.*, mc.character_name, mc.cast_order
       FROM cast_table c
       JOIN movie_cast mc ON c.id = mc.cast_id
       WHERE mc.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(fullResult.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ message: 'Cast member already added to this movie' });
    }
    console.error('Error adding cast to movie:', error);
    res.status(500).json({ message: 'Error adding cast to movie' });
  }
});

// Remove cast member from movie (authenticated only)
router.delete('/movie/:movieId/:castId', requireAuth, async (req, res) => {
  try {
    const { movieId, castId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM movie_cast WHERE movie_id = $1 AND cast_id = $2 RETURNING *',
      [movieId, castId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cast member not found in this movie' });
    }
    
    res.json({ message: 'Cast member removed from movie successfully' });
  } catch (error) {
    console.error('Error removing cast from movie:', error);
    res.status(500).json({ message: 'Error removing cast from movie' });
  }
});

module.exports = router;

