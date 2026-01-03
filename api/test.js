// Simple test function to verify Vercel routing works
module.exports = (req, res) => {
  console.log('✅ Test function called');
  res.json({ 
    status: 'ok', 
    message: 'Test function works!',
    path: req.url,
    method: req.method
  });
};

