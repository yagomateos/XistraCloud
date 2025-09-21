const http = require('http');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'http://localhost:3002';

const server = http.createServer((req, res) => {
  console.log(`📥 Request: ${req.url}`);
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Handle root path
  if (url.pathname === '/') {
    // Get hash parameters (they come as fragment after #)
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');
    const type = url.searchParams.get('type');
    
    console.log('📋 Params:', { 
      accessToken: !!accessToken, 
      refreshToken: !!refreshToken, 
      type 
    });
    
    if (accessToken && refreshToken && type) {
      // Redirect to production with parameters
      const redirectUrl = `${PRODUCTION_URL}/email-confirmed?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}&expires_at=${url.searchParams.get('expires_at')}&expires_in=${url.searchParams.get('expires_in')}&token_type=${url.searchParams.get('token_type')}`;
      
      console.log('🔄 Redirecting to:', redirectUrl);
      
      res.writeHead(302, {
        'Location': redirectUrl,
        'Cache-Control': 'no-cache'
      });
      res.end();
      return;
    }
    
    // If no parameters, show redirect page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>XistraCloud - Redirigiendo</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui; text-align: center; padding: 2rem; }
          .container { max-width: 400px; margin: 0 auto; }
          .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h2>XistraCloud</h2>
          <p>Redirigiendo a la aplicación...</p>
        </div>
        <script>
          // Check for hash parameters (email confirmation)
          if (window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const type = params.get('type');
            
            if (accessToken && refreshToken && type) {
              const redirectUrl = '${PRODUCTION_URL}/email-confirmed?' + new URLSearchParams({
                access_token: accessToken,
                refresh_token: refreshToken,
                type: type,
                expires_at: params.get('expires_at') || '',
                expires_in: params.get('expires_in') || '',
                token_type: params.get('token_type') || ''
              });
              
              console.log('🔄 Redirecting with hash params to:', redirectUrl);
              window.location.href = redirectUrl;
              return;
            }
          }
          
          // Otherwise redirect to production
          setTimeout(() => {
            window.location.href = '${PRODUCTION_URL}';
          }, 1500);
        </script>
      </body>
      </html>
    `);
  } else {
    // For other paths, redirect to production
    const redirectUrl = `${PRODUCTION_URL}${req.url}`;
    res.writeHead(302, { 'Location': redirectUrl });
    res.end();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor de redirección funcionando en http://localhost:${PORT}`);
  console.log(`📍 Redirige a: ${PRODUCTION_URL}`);
  console.log('🔧 Para confirmar emails, asegúrate de configurar las URLs en Supabase');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n👋 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});
