const express = require('express');
const pool = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all movies with optional filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      search, 
      year, 
      genre, 
      genre_ids,
      year_min,
      year_max,
      rating_min,
      rating_max,
      director,
      has_reviews,
      in_watchlist,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 100, 
      offset = 0, 
      include_genres 
    } = req.query;
    
    let query = `
      SELECT m.*, 
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM movies m
      LEFT JOIN reviews r ON m.id = r.movie_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND m.title ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }
    
    if (year) {
      paramCount++;
      query += ` AND m.year = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    if (year_min) {
      paramCount++;
      query += ` AND m.year >= $${paramCount}`;
      params.push(parseInt(year_min));
    }
    
    if (year_max) {
      paramCount++;
      query += ` AND m.year <= $${paramCount}`;
      params.push(parseInt(year_max));
    }
    
    if (rating_min) {
      paramCount++;
      query += ` AND (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = m.id) >= $${paramCount}`;
      params.push(parseFloat(rating_min));
    }
    
    if (rating_max) {
      paramCount++;
      query += ` AND (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = m.id) <= $${paramCount}`;
      params.push(parseFloat(rating_max));
    }
    
    if (director) {
      paramCount++;
      query += ` AND m.director ILIKE $${paramCount}`;
      params.push(`%${director}%`);
    }
    
    // Filter by genre using movie_genres junction table
    if (genre) {
      paramCount++;
      query += ` AND m.id IN (
        SELECT movie_id FROM movie_genres mg
        JOIN genres g ON mg.genre_id = g.id
        WHERE g.name ILIKE $${paramCount}
      )`;
      params.push(`%${genre}%`);
    }
    
    // Filter by multiple genre IDs
    if (genre_ids) {
      const genreIdArray = Array.isArray(genre_ids) ? genre_ids : [genre_ids];
      if (genreIdArray.length > 0) {
        paramCount++;
        const placeholders = genreIdArray.map((_, i) => `$${paramCount + i}`).join(',');
        query += ` AND m.id IN (
          SELECT movie_id FROM movie_genres
          WHERE genre_id IN (${placeholders})
          GROUP BY movie_id
          HAVING COUNT(DISTINCT genre_id) = $${paramCount + genreIdArray.length}
        )`;
        params.push(...genreIdArray.map(id => parseInt(id)));
        paramCount += genreIdArray.length - 1;
      }
    }
    
    if (has_reviews === 'true') {
      query += ` AND EXISTS (SELECT 1 FROM reviews WHERE movie_id = m.id)`;
    } else if (has_reviews === 'false') {
      query += ` AND NOT EXISTS (SELECT 1 FROM reviews WHERE movie_id = m.id)`;
    }
    
    if (in_watchlist === 'true' && req.user) {
      paramCount++;
      query += ` AND EXISTS (SELECT 1 FROM watchlist WHERE movie_id = m.id AND user_id = $${paramCount})`;
      params.push(req.user.id);
    } else if (in_watchlist === 'false' && req.user) {
      paramCount++;
      query += ` AND NOT EXISTS (SELECT 1 FROM watchlist WHERE movie_id = m.id AND user_id = $${paramCount})`;
      params.push(req.user.id);
    }
    
    query += ` GROUP BY m.id`;
    
    // Sorting
    const validSortFields = ['title', 'year', 'created_at', 'rating', 'review_count'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    if (sortField === 'rating') {
      query += ` ORDER BY average_rating ${sortDir}`;
    } else if (sortField === 'review_count') {
      query += ` ORDER BY review_count ${sortDir}`;
    } else {
      query += ` ORDER BY m.${sortField} ${sortDir}`;
    }
    
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    let movies = result.rows.map(row => {
      const movie = {
        id: row.id,
        title: row.title,
        year: row.year,
        director: row.director,
        poster_url: row.poster_url,
        imdb_id: row.imdb_id,
        created_at: row.created_at
      };
      // Convert average_rating and review_count to numbers
      if (row.average_rating !== null) {
        movie.average_rating = parseFloat(row.average_rating);
      }
      if (row.review_count !== null) {
        movie.review_count = parseInt(row.review_count);
      }
      return movie;
    });
    
    // Optionally include genres for each movie
    if (include_genres === 'true') {
      for (let movie of movies) {
        const genresResult = await pool.query(
          `SELECT g.id, g.name
           FROM genres g
           JOIN movie_genres mg ON g.id = mg.genre_id
           WHERE mg.movie_id = $1
           ORDER BY g.name`,
          [movie.id]
        );
        movie.genres = genresResult.rows;
      }
    }
    
    res.json({
      movies: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

// Get single movie by ID (optionally with cast, screenwriters, and genres)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { include_cast, include_screenwriters, include_genres } = req.query;
    
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const movie = result.rows[0];
    
    // Optionally include genres
    if (include_genres === 'true' || include_genres === undefined) {
      const genresResult = await pool.query(
        `SELECT g.id, g.name
         FROM genres g
         JOIN movie_genres mg ON g.id = mg.genre_id
         WHERE mg.movie_id = $1
         ORDER BY g.name`,
        [id]
      );
      movie.genres = genresResult.rows;
    }
    
    // Include cast by default for detail page
    if (include_cast === 'true' || include_cast === undefined) {
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
    
    // Include screenwriters by default for detail page
    if (include_screenwriters === 'true' || include_screenwriters === undefined) {
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { title, year, director, genres, poster_url, imdb_id } = req.body;
    
    if (!title) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Insert movie (genre column kept for backward compatibility, but we'll use movie_genres)
    const movieResult = await client.query(
      `INSERT INTO movies (title, year, director, poster_url, imdb_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, year || null, director || null, poster_url || null, imdb_id || null]
    );
    
    const movie = movieResult.rows[0];
    
    // Add genres if provided
    if (genres && Array.isArray(genres) && genres.length > 0) {
      for (const genreName of genres) {
        // Get or create genre
        let genreResult = await client.query('SELECT id FROM genres WHERE name = $1', [genreName]);
        
        if (genreResult.rows.length === 0) {
          // Create new genre if it doesn't exist
          genreResult = await client.query(
            'INSERT INTO genres (name) VALUES ($1) RETURNING id',
            [genreName]
          );
        }
        
        const genreId = genreResult.rows[0].id;
        
        // Link movie to genre
        await client.query(
          'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [movie.id, genreId]
        );
      }
      
      // Fetch genres for response
      const genresResult = await client.query(
        `SELECT g.id, g.name
         FROM genres g
         JOIN movie_genres mg ON g.id = mg.genre_id
         WHERE mg.movie_id = $1
         ORDER BY g.name`,
        [movie.id]
      );
      movie.genres = genresResult.rows;
    }
    
    await client.query('COMMIT');
    res.status(201).json(movie);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Error creating movie' });
  } finally {
    client.release();
  }
});

// Update movie (authenticated only)
router.put('/:id', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { title, year, director, genres, poster_url, imdb_id } = req.body;
    
    // Update movie basic info
    const result = await client.query(
      `UPDATE movies 
       SET title = COALESCE($1, title),
           year = COALESCE($2, year),
           director = COALESCE($3, director),
           poster_url = COALESCE($4, poster_url),
           imdb_id = COALESCE($5, imdb_id)
       WHERE id = $6
       RETURNING *`,
      [title, year, director, poster_url, imdb_id, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const movie = result.rows[0];
    
    // Update genres if provided
    if (genres !== undefined) {
      // Remove all existing genre associations
      await client.query('DELETE FROM movie_genres WHERE movie_id = $1', [id]);
      
      // Add new genre associations
      if (Array.isArray(genres) && genres.length > 0) {
        for (const genreName of genres) {
          // Get or create genre
          let genreResult = await client.query('SELECT id FROM genres WHERE name = $1', [genreName]);
          
          if (genreResult.rows.length === 0) {
            genreResult = await client.query(
              'INSERT INTO genres (name) VALUES ($1) RETURNING id',
              [genreName]
            );
          }
          
          const genreId = genreResult.rows[0].id;
          
          // Link movie to genre
          await client.query(
            'INSERT INTO movie_genres (movie_id, genre_id) VALUES ($1, $2)',
            [id, genreId]
          );
        }
      }
      
      // Fetch updated genres
      const genresResult = await client.query(
        `SELECT g.id, g.name
         FROM genres g
         JOIN movie_genres mg ON g.id = mg.genre_id
         WHERE mg.movie_id = $1
         ORDER BY g.name`,
        [id]
      );
      movie.genres = genresResult.rows;
    }
    
    await client.query('COMMIT');
    res.json(movie);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Error updating movie' });
  } finally {
    client.release();
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

