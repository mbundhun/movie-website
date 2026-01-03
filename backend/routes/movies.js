const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all movies with optional filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, year, genre, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM movies WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND title ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }
    
    if (year) {
      paramCount++;
      query += ` AND year = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    if (genre) {
      paramCount++;
      query += ` AND genre ILIKE $${paramCount}`;
      params.push(`%${genre}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      movies: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

// Get single movie by ID (optionally with cast and screenwriters)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { include_cast, include_screenwriters } = req.query;
    
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const movie = result.rows[0];
    
    // Optionally include cast
    if (include_cast === 'true') {
      const castResult = await pool.query(
        `SELECT c.*, mc.character_name, mc.cast_order
         FROM cast_table c
         JOIN movie_cast mc ON c.id = mc.cast_id
         WHERE mc.movie_id = $1
         ORDER BY mc.cast_order, c.name`,
        [id]
      );
      movie.cast = castResult.rows;
    }
    
    // Optionally include screenwriters
    if (include_screenwriters === 'true') {
      const screenwritersResult = await pool.query(
        `SELECT s.*, ms.screenwriter_order
         FROM screenwriters s
         JOIN movie_screenwriters ms ON s.id = ms.screenwriter_id
         WHERE ms.movie_id = $1
         ORDER BY ms.screenwriter_order, s.name`,
        [id]
      );
      movie.screenwriters = screenwritersResult.rows;
    }
    
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: 'Error fetching movie' });
  }
});

// Add new movie (authenticated only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, year, director, genre, poster_url, imdb_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO movies (title, year, director, genre, poster_url, imdb_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, year || null, director || null, genre || null, poster_url || null, imdb_id || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Error creating movie' });
  }
});

// Update movie (authenticated only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, year, director, genre, poster_url, imdb_id } = req.body;
    
    const result = await pool.query(
      `UPDATE movies 
       SET title = COALESCE($1, title),
           year = COALESCE($2, year),
           director = COALESCE($3, director),
           genre = COALESCE($4, genre),
           poster_url = COALESCE($5, poster_url),
           imdb_id = COALESCE($6, imdb_id)
       WHERE id = $7
       RETURNING *`,
      [title, year, director, genre, poster_url, imdb_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Error updating movie' });
  }
});

// Delete movie (authenticated only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Error deleting movie' });
  }
});

module.exports = router;

