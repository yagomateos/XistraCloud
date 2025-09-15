const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Función para generar puerto aleatorio
function getRandomPort() {
  return Math.floor(Math.random() * (9999 - 8000) + 8000);
}

// Función para generar contraseña aleatoria
function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

// Almacenar apps desplegadas
const deployedApps = new Map();

app.get('/apps/templates', (req, res) => {
  console.log('[backend] GET /apps/templates from', req.ip);
  res.json({
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
      }
    ],
    categories: {
      cms: { name: 'CMS', icon: '📝' },
      database: { name: 'Base de datos', icon: '🗄️' },
      automation: { name: 'Automatización', icon: '🔗' }
    }
  });
});

app.post('/apps/deploy', async (req, res) => {
  console.log('[backend] POST /apps/deploy from', req.ip, 'body:', JSON.stringify(req.body || {}));
  
  const { templateId, name, environment } = req.body;
  
  if (!templateId || !name) {
    return res.status(400).json({ 
      success: false, 
      error: 'templateId y name son requeridos' 
    });
  }

  try {
    // Generar puerto aleatorio
    const port = getRandomPort();
    const appName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Determinar entorno y URLs
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction ? 'https://xistracloud.com' : 'http://localhost';
    const siteUrl = isProduction ? `${baseUrl}/app/${port}` : `${baseUrl}:${port}`;
    
    // Leer plantilla Docker Compose
    const templatePath = path.join(__dirname, 'docker-templates', `${templateId}.yml`);
    let dockerComposeContent = await fs.readFile(templatePath, 'utf8');
    
    // Generar variables de entorno
    const envVars = {
      APP_NAME: appName,
      DEPLOY_NAME: appName,
      PORT: port,
      SITE_URL: siteUrl,
      FORCE_SSL: isProduction ? 'true' : 'false',
      DB_PASSWORD: generatePassword(),
      DB_ROOT_PASSWORD: generatePassword(),
      DB_NAME: environment.DB_NAME || 'wordpress',
      DB_USER: environment.DB_USER || 'wordpress',
      N8N_USER: environment.N8N_USER || 'admin',
      N8N_PASSWORD: environment.N8N_PASSWORD || generatePassword(),
      // Variables específicas para WordPress - mapear desde frontend
      SITE_NAME: environment.SITE_NAME || environment.siteName || name,
      SITE_DESCRIPTION: environment.SITE_DESCRIPTION || environment.description || 'Un sitio increíble',
      ADMIN_USER: environment.ADMIN_USER || environment.adminUser || 'admin',
      ADMIN_EMAIL: environment.ADMIN_EMAIL || environment.adminEmail || 'admin@example.com',
      ADMIN_PASSWORD: environment.ADMIN_PASSWORD || environment.adminPassword || generatePassword(),
      LANGUAGE: environment.LANGUAGE || environment.language || 'es_ES'
    };
    
    // Reemplazar variables en la plantilla
    Object.entries(envVars).forEach(([key, value]) => {
      dockerComposeContent = dockerComposeContent.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    });
    
    // Crear directorio para la app
    const appDir = path.join(__dirname, 'deployed-apps', appName);
    await fs.mkdir(appDir, { recursive: true });
    
    // Escribir docker-compose.yml
    const dockerComposePath = path.join(appDir, 'docker-compose.yml');
    await fs.writeFile(dockerComposePath, dockerComposeContent);
    
    console.log(`[deploy] Docker Compose creado: ${dockerComposePath}`);
    
    // NO crear archivo SQL - dejar que MySQL use sus variables de entorno por defecto
    
    // Ejecutar docker-compose up
    console.log(`[deploy] Desplegando ${templateId} como ${appName} en puerto ${port}`);
    
    const deployCommand = `cd "${appDir}" && docker-compose up -d`;
    
    await new Promise((resolve, reject) => {
      exec(deployCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`[deploy] Error: ${error}`);
          reject(error);
          return;
        }
        console.log(`[deploy] stdout: ${stdout}`);
        if (stderr) console.log(`[deploy] stderr: ${stderr}`);
        resolve();
      });
    });
    
    // Determinar URL de acceso
    let accessUrl;
    let loginInfo = {};
    
    switch (templateId) {
      case 'wordpress':
        accessUrl = siteUrl;
        loginInfo = {
          admin_url: `${siteUrl}/wp-admin`,
          username: envVars.ADMIN_USER,
          password: envVars.ADMIN_PASSWORD,
          email: envVars.ADMIN_EMAIL,
          notes: 'WordPress configurado automáticamente con URL correcta. Puedes acceder directamente al panel de admin.'
        };
        break;
      case 'n8n':
        accessUrl = siteUrl;
        loginInfo = {
          username: envVars.N8N_USER,
          password: envVars.N8N_PASSWORD,
          notes: 'Usa las credenciales para acceder'
        };
        break;
      case 'mysql':
        accessUrl = isProduction ? `mysql://xistracloud.com:${port}` : `mysql://localhost:${port}`;
        loginInfo = {
          host: isProduction ? 'xistracloud.com' : 'localhost',
          port: port,
          root_password: envVars.DB_ROOT_PASSWORD,
          database: envVars.DB_NAME,
          user: envVars.DB_USER,
          password: envVars.DB_PASSWORD,
          notes: 'Conecta usando cualquier cliente MySQL'
        };
        break;
    }
    
    // Guardar información de la app desplegada
    const appInfo = {
      id: appName,
      templateId,
      name,
      status: 'running',
      port,
      accessUrl,
      loginInfo,
      deployedAt: new Date().toISOString(),
      dockerComposePath
    };
    
    deployedApps.set(appName, appInfo);
    
    console.log(`[deploy] ✅ ${templateId} desplegado exitosamente como ${appName}`);
    console.log(`[deploy] 🌐 Acceso: ${accessUrl}`);
    
    res.json({
      success: true,
      deployment: appInfo
    });
    
  } catch (error) {
    console.error(`[deploy] ❌ Error desplegando ${templateId}:`, error);
    res.status(500).json({
      success: false,
      error: `Error desplegando ${templateId}: ${error.message}`
    });
  }
});

// Endpoint para listar apps desplegadas
app.get('/apps/deployed', (req, res) => {
  console.log('[backend] GET /apps/deployed');
  const apps = Array.from(deployedApps.values());
  res.json({ apps });
});

// Endpoint para proyectos (compatibilidad con la UI existente + proyectos de Supabase)
app.get('/projects', async (req, res) => {
  console.log('[backend] GET /projects');
  
  try {
    // Intentar obtener proyectos de Supabase (si está configurado)
    let supabaseProjects = [];
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || 'https://metzjfocvkelucinstul.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED-SUPABASE-SERVICE-KEY***';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase.from('projects').select('*');
      if (!error && data) {
        supabaseProjects = data;
      }
    } catch (e) {
      console.log('[projects] Supabase no disponible, usando solo apps Docker');
    }
    
    // Convertir apps desplegadas al formato de proyectos
    const dockerProjects = Array.from(deployedApps.values()).map(app => ({
      id: app.id,
      name: app.name,
      repository: `docker:${app.templateId}`,
      framework: app.templateId,
      status: app.status,
      url: app.accessUrl,
      deploy_type: 'docker',
      created_at: app.deployedAt,
      container_id: app.id
    }));
    
    // Combinar proyectos de Supabase + Docker
    const allProjects = [...supabaseProjects, ...dockerProjects];
    res.json(allProjects);
    
  } catch (error) {
    console.error('[projects] Error:', error);
    res.status(500).json({ error: 'Error obteniendo proyectos' });
  }
});

// Endpoint para eliminar proyecto (compatibilidad)
app.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[backend] DELETE /projects/${id}`);
  
  // Redirigir al endpoint de apps deployed
  const app = deployedApps.get(id);
  if (!app) {
    return res.status(404).json({ error: 'Proyecto no encontrado' });
  }
  
  try {
    // Ejecutar docker-compose down
    const appDir = path.dirname(app.dockerComposePath);
    const stopCommand = `cd "${appDir}" && docker-compose down -v`;
    
    await new Promise((resolve, reject) => {
      exec(stopCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`[delete-project] Error: ${error}`);
          reject(error);
          return;
        }
        console.log(`[delete-project] stdout: ${stdout}`);
        if (stderr) console.log(`[delete-project] stderr: ${stderr}`);
        resolve();
      });
    });
    
    // Eliminar de la lista
    deployedApps.delete(id);
    
    console.log(`[delete-project] ✅ Proyecto ${id} eliminado exitosamente`);
    res.json({ message: 'Proyecto eliminado exitosamente' });
    
  } catch (error) {
    console.error(`[delete-project] ❌ Error eliminando proyecto ${id}:`, error);
    res.status(500).json({ error: `Error eliminando proyecto: ${error.message}` });
  }
});

// Endpoint para eliminar app desplegada
app.delete('/apps/deployed/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[backend] DELETE /apps/deployed/${id}`);
  
  const app = deployedApps.get(id);
  if (!app) {
    return res.status(404).json({ success: false, error: 'App no encontrada' });
  }
  
  try {
    // Ejecutar docker-compose down
    const appDir = path.dirname(app.dockerComposePath);
    const stopCommand = `cd "${appDir}" && docker-compose down -v`;
    
    await new Promise((resolve, reject) => {
      exec(stopCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`[undeploy] Error: ${error}`);
          reject(error);
          return;
        }
        console.log(`[undeploy] stdout: ${stdout}`);
        if (stderr) console.log(`[undeploy] stderr: ${stderr}`);
        resolve();
      });
    });
    
    // Eliminar de la lista
    deployedApps.delete(id);
    
    console.log(`[undeploy] ✅ App ${id} eliminada exitosamente`);
    res.json({ success: true });
    
  } catch (error) {
    console.error(`[undeploy] ❌ Error eliminando app ${id}:`, error);
    res.status(500).json({
      success: false,
      error: `Error eliminando app: ${error.message}`
    });
  }
});

// Endpoint para estadísticas del dashboard
app.get('/dashboard/stats', (req, res) => {
  console.log('[backend] GET /dashboard/stats from', req.ip);
  
  const dockerApps = Array.from(deployedApps.values());
  
  // Contar estadísticas de las apps Docker
  const dockerStats = {
    active: dockerApps.filter(app => app.status === 'running').length,
    building: 0, // Por ahora no tenemos estado "building" para Docker
    error: dockerApps.filter(app => app.status === 'error').length,
    stopped: dockerApps.filter(app => app.status === 'stopped').length,
    pending: dockerApps.filter(app => app.status === 'pending').length
  };
  
  res.json({
    projectStats: dockerStats,
    recentActivity: dockerApps
      .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        title: `${app.name} desplegado`,
        description: `${app.templateId} configurado y listo`,
        timestamp: app.deployedAt,
        type: 'deployment'
      })),
    totalProjects: dockerApps.length,
    successRate: dockerApps.length > 0 ? 
      (dockerStats.active / dockerApps.length * 100).toFixed(1) : 
      '100.0'
  });
});

// Endpoint de proxy dinámico para apps
app.get('/proxy/:port/*', (req, res) => {
  const { port: appPort } = req.params;
  const path = req.params[0] || '';
  const queryString = req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '';
  
  console.log(`[proxy] Proxying to localhost:${appPort}/${path}${queryString}`);
  
  // Crear proxy request
  const proxyUrl = `http://localhost:${appPort}/${path}${queryString}`;
  
  const http = require('http');
  const url = require('url');
  const parsedUrl = url.parse(proxyUrl);
  
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      'host': parsedUrl.host,
      'x-forwarded-for': req.ip,
      'x-forwarded-proto': 'https'
    }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    // Copiar headers de respuesta
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (error) => {
    console.error(`[proxy] Error: ${error.message}`);
    res.status(502).send('Bad Gateway');
  });
  
  // Si es POST/PUT, pipe el body
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

app.listen(port, () => {
  console.log(`🚀 XistraCloud Real Docker Backend listening at http://localhost:${port}`);
  console.log(`📁 Docker templates: ${path.join(__dirname, 'docker-templates')}`);
  console.log(`📦 Deployed apps will be stored in: ${path.join(__dirname, 'deployed-apps')}`);
});
