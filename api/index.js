const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Templates data (simulando el Docker backend pero sin Docker)
const TEMPLATES_DATA = {
  templates: [
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'CMS popular para blogs y webs. Incluye MySQL.',
      category: 'cms',
      ports: [80],
      env_required: ['DB_PASSWORD', 'DB_ROOT_PASSWORD'],
      icon: '📝',
      features: ['CMS completo', 'MySQL incluida', 'Panel de admin', 'Temas y plugins']
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Automatización de flujos de trabajo.',
      category: 'automation',
      ports: [5678],
      env_required: ['N8N_USER', 'N8N_PASSWORD', 'DB_PASSWORD'],
      icon: '🔗',
      features: ['Automatización visual', 'PostgreSQL incluida', 'API integrations', 'Workflows']
    },
    {
      id: 'mysql',
      name: 'MySQL',
      description: 'Base de datos relacional MySQL 8.0.',
      category: 'database',
      ports: [3306],
      env_required: ['DB_ROOT_PASSWORD', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'],
      icon: '🗄️',
      features: ['MySQL 8.0', 'Datos persistentes', 'Usuario personalizable', 'Puerto configurable']
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      description: 'Framework React para aplicaciones web modernas.',
      category: 'frontend',
      ports: [3000],
      env_required: [],
      icon: '⚡',
      features: ['SSR/SSG', 'API Routes', 'TypeScript', 'Optimizado']
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Base de datos avanzada con soporte JSON.',
      category: 'database',
      ports: [5432],
      env_required: ['POSTGRES_PASSWORD', 'POSTGRES_USER', 'POSTGRES_DB'],
      icon: '🐘',
      features: ['PostgreSQL 15', 'JSON support', 'Extensiones', 'Backup automático']
    }
  ],
  categories: {
    cms: { name: 'CMS', icon: '📝' },
    database: { name: 'Base de datos', icon: '🗄️' },
    automation: { name: 'Automatización', icon: '🔗' },
    frontend: { name: 'Frontend', icon: '⚡' }
  }
};

// Simular apps desplegadas
const deployedApps = new Map();

// Endpoints principales
app.get('/apps/templates', (req, res) => {
  console.log('[API] GET /apps/templates');
  res.json(TEMPLATES_DATA);
});

app.post('/apps/deploy', (req, res) => {
  console.log('[API] POST /apps/deploy:', req.body);
  
  const { templateId, name, environment } = req.body;
  
  if (!templateId || !name) {
    return res.status(400).json({ 
      success: false, 
      error: 'templateId y name son requeridos' 
    });
  }

  // Simular deployment exitoso
  const port = Math.floor(Math.random() * (9999 - 8000) + 8000);
  const appId = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  
  const deployment = {
    id: appId,
    name: name,
    templateId: templateId,
    status: 'running',
    port: port,
    accessUrl: `https://demo-wordpress.xistracloud.com`,
    urls: [`https://demo-wordpress.xistracloud.com`],
    deployedAt: new Date().toISOString()
  };
  
  deployedApps.set(appId, deployment);
  
  res.json({
    success: true,
    deployment: deployment,
    message: 'Aplicación desplegada exitosamente (demo)'
  });
});

app.get('/apps/deployed', (req, res) => {
  console.log('[API] GET /apps/deployed');
  const apps = Array.from(deployedApps.values());
  res.json({ apps });
});

app.get('/dashboard/stats', (req, res) => {
  console.log('[API] GET /dashboard/stats');
  
  const apps = Array.from(deployedApps.values());
  
  const stats = {
    active: apps.filter(app => app.status === 'running').length,
    building: 0,
    error: 0,
    stopped: 0,
    pending: 0
  };
  
  res.json({
    projectStats: stats,
    recentActivity: apps
      .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        title: `${app.name} desplegado`,
        description: `${app.templateId} configurado y listo`,
        timestamp: app.deployedAt,
        type: 'deployment'
      })),
    totalProjects: apps.length,
    successRate: apps.length > 0 ? '100.0' : '100.0'
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'XistraCloud API Backend (Hostinger)',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint no encontrado' 
  });
});

app.listen(port, () => {
  console.log(`🚀 XistraCloud API Backend listening at http://localhost:${port}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for all origins`);
});

module.exports = app;
