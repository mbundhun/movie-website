const express = require('express');
const pool = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Request admin access (authenticated users only)
router.post('/request', requireAuth, async (req, res) => {
  try {
    const { request_message } = req.body;
    
    // Check if user already has a pending request
    const existingRequest = await pool.query(
      'SELECT id, status FROM admin_requests WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingRequest.rows.length > 0) {
      const request = existingRequest.rows[0];
      if (request.status === 'pending') {
        return res.status(400).json({ message: 'You already have a pending admin request' });
      }
    }
    
    // Create or update admin request
    await pool.query(
      `INSERT INTO admin_requests (user_id, request_message, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (user_id) 
       DO UPDATE SET request_message = $2, status = 'pending', created_at = CURRENT_TIMESTAMP`,
      [req.user.id, request_message || null]
    );
    
    // TODO: Send email notification to admin
    // For now, just return success
    res.json({ 
      message: 'Admin request submitted successfully. You will be notified when it is reviewed.' 
    });
  } catch (error) {
    console.error('Error creating admin request:', error);
    res.status(500).json({ message: 'Error submitting admin request' });
  }
});

// Get admin requests (admin only)
router.get('/requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, u.username, u.email
       FROM admin_requests ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.status = 'pending'
       ORDER BY ar.created_at DESC`
    );
    
    res.json({ requests: result.rows });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ message: 'Error fetching admin requests' });
  }
});

// Approve or reject admin request (admin only)
router.put('/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }
    
    // Get the request
    const requestResult = await pool.query(
      'SELECT user_id FROM admin_requests WHERE id = $1',
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Admin request not found' });
    }
    
    const userId = requestResult.rows[0].user_id;
    
    if (action === 'approve') {
      // Update user to be admin
      await pool.query(
        'UPDATE users SET is_admin = TRUE WHERE id = $1',
        [userId]
      );
      
      // Update request status
      await pool.query(
        `UPDATE admin_requests 
         SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [req.user.id, id]
      );
      
      res.json({ message: 'Admin request approved' });
    } else {
      // Reject request
      await pool.query(
        `UPDATE admin_requests 
         SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [req.user.id, id]
      );
      
      res.json({ message: 'Admin request rejected' });
    }
    
    // TODO: Send email notification to user about the decision
  } catch (error) {
    console.error('Error processing admin request:', error);
    res.status(500).json({ message: 'Error processing admin request' });
  }
});

module.exports = router;

