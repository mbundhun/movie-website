// Vercel serverless function
// Simple version to test if routing works

console.log('API function loaded');

module.exports = (req, res) => {
  console.log('API function invoked:', req.url, req.method);
  
  // Handle health check
  if (req.url === '/api/health' || req.url === '/health') {
    return res.json({ status: 'ok', message: 'Server is running', url: req.url });
  }
  
  // Handle test endpoint
  if (req.url === '/api/test' || req.url === '/test') {
    return res.json({ status: 'ok', message: 'Test endpoint works!', url: req.url });
  }
  
  // Default response
  res.json({ 
    status: 'ok', 
    message: 'API function is working',
    url: req.url,
    method: req.method
  });
};
