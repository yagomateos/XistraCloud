// Emergency health check endpoint to verify Railway is running latest code
app.get('/debug/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2025-09-12-18:47',
    message: 'Railway debugging endpoint - if you see this, latest code is deployed',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'configured' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    }
  });
});

// Quick domain test endpoint
app.post('/debug/domain-test', async (req, res) => {
  try {
    console.log('🚨 DEBUG ENDPOINT CALLED');
    console.log('Request body:', req.body);
    
    // Quick validation
    const { domain, project_id, projectId } = req.body;
    const projectIdValue = project_id || projectId;
    
    if (!domain || !projectIdValue) {
      return res.status(400).json({ 
        error: 'Missing fields',
        received: { domain, project_id, projectId, projectIdValue }
      });
    }
    
    // Return success without database call
    res.json({
      status: 'debug_success',
      message: 'Debug endpoint working',
      received: { domain, projectIdValue },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'debug_error', 
      message: error.message,
      stack: error.stack 
    });
  }
});
