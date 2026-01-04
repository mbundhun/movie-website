const express = require('express');
const pool = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all genres
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY name');
    res.json({ genres: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
});

// Get single genre by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM genres WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching genre:', error);
    res.status(500).json({ message: 'Error fetching genre' });
  }
});

module.exports = router;

