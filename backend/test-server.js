const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/apps/templates', (req, res) => {
  console.log('[backend] GET /apps/templates from', req.ip);
  res.json({
    templates: [
      {
        id: 'wordpress',
        name: 'WordPress',
        description: 'CMS popular para blogs y webs.',
        category: 'cms',
        ports: [8080],
        env_required: ['WORDPRESS_DB_USER', 'WORDPRESS_DB_PASSWORD'],
        icon: '📝'
      },
      {
        id: 'mysql',
        name: 'MySQL',
        description: 'Base de datos relacional.',
        category: 'database',
        ports: [3306],
        env_required: ['MYSQL_ROOT_PASSWORD'],
        icon: '🗄️'
      }
    ],
    categories: {
      cms: { name: 'CMS', icon: '📝' },
      database: { name: 'Base de datos', icon: '🗄️' }
    }
  });
});

app.post('/apps/deploy', (req, res) => {
  console.log('[backend] POST /apps/deploy from', req.ip, 'body:', JSON.stringify(req.body || {}));
  const { templateId, name, environment } = req.body;
  
  // Simula despliegue exitoso y devuelve URL de la app
  res.json({
    success: true,
    deployment: {
      id: `${templateId}-instance-001`,
      name,
      status: 'running',
      urls: [`http://localhost:8080/${templateId}`],
      environment
    }
  });
});

app.listen(port, () => {
  console.log(`Test backend listening at http://localhost:${port}`);
});
Apps.tsx:224 Uncaught ReferenceError: handleInstallTemplate is not defined
    at onClick (Apps.tsx:224:36)

chunk-W6L2VRDA.js?v=6d0ff900:3750 Uncaught ReferenceError: handleInstallTemplate is not defined
    at onClick (Apps.tsx:224:36)
