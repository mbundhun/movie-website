// Simplest possible Vercel serverless function
module.exports = (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API function is working!',
    path: req.url,
    method: req.method
  });
};
