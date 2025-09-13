// Types and interfaces
export interface Project {
  id: string;
  name: string;
  status: 'deployed' | 'building' | 'failed' | 'stopped' | 'pending';
  created_at: string;
  url?: string | null;
  repository: string;
  framework: string;
  user_id?: string;
  container_id?: string | null;
  deploy_type?: string;
  compose_path?: string | null;
  lastDeploy: string; // For ProjectCard compatibility - required
}

export interface Domain {
  id: string;
  domain: string;
  project_id: string;
  project_name: string;
  status: string;
  ssl_status: string;
  created_at: string;
}

export interface Log {
  id: string | number;
  timestamp?: string; // Optional - new Railway-style logs use this
  level: string;
  message: string;
  details?: string; // Optional details field for Railway-style logs
  source: string;
  project_id?: string;
  project_name?: string;
  domain_id?: string;
  domain_name?: string;
  type?: string; // Optional backwards compatibility
  created_at?: string; // Optional backwards compatibility - old logs use this
}

// Alias for backwards compatibility
export type LogEntry = Log;

export interface DashboardStats {
  projectStats: {
    active: number;
    building: number;
    error: number;
    stopped?: number;
    pending?: number;
  };
  deploymentTrend: Array<{
    date: string;
    deployments: number;
    success: number;
    failed: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    project: string;
    message: string;
    created_at: string;
    status: string;
  }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://xistracloud-production.up.railway.app';
const USE_MOCK_DATA = false; // ✅ Fixed! Now using REAL Supabase data

// Debug logs
console.log('🔧 DEBUG - API Configuration:');
console.log('  API_URL:', API_URL);
console.log('  VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('  USE_MOCK_DATA:', USE_MOCK_DATA);

// Mock data for fallback (mutable para permitir eliminaciones)
let MOCK_PROJECTS: Project[] = [
  {
    id: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    name: 'example-voting-app',
    repository: 'https://github.com/dockersamples/example-voting-app',
    framework: 'Docker Compose',
    status: 'deployed',
    url: 'https://example-voting-app.xistracloud.com',
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    container_id: 'cnt-123',
    deploy_type: 'compose',
    compose_path: './docker-compose.yml',
    lastDeploy: new Date(Date.now() - 86400000 * 1).toLocaleDateString()
  },
  {
    id: 'f8275b2f-3030-4893-9473-1a10fe393092',
    name: 'nextjs-landing-page',
    repository: 'https://github.com/vercel/next.js',
    framework: 'Next.js',
    status: 'building',
    url: null,
    user_id: 'user-123',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    container_id: null,
    deploy_type: 'git',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 1800000).toLocaleDateString()
  },
  {
    id: '9a3d5f2e-8b7c-4d6e-9f8g-1h2i3j4k5l6m',
    name: 'fastapi-blog-api',
    repository: 'https://github.com/fastapi/fastapi',
    framework: 'FastAPI',
    status: 'deployed',
    url: 'https://blog-api.xistracloud.com',
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    container_id: 'cnt-456',
    deploy_type: 'dockerfile',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'react-dashboard',
    repository: 'https://github.com/facebook/react',
    framework: 'React',
    status: 'deployed',
    url: 'https://dashboard.xistracloud.com',
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    container_id: 'cnt-789',
    deploy_type: 'git',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 86400000 * 3).toLocaleDateString()
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    name: 'express-api-gateway',
    repository: 'https://github.com/expressjs/express',
    framework: 'Express.js',
    status: 'failed',
    url: null,
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    container_id: null,
    deploy_type: 'git',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    name: 'vue-ecommerce',
    repository: 'https://github.com/vuejs/vue',
    framework: 'Vue.js',
    status: 'deployed',
    url: 'https://shop.xistracloud.com',
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    container_id: 'cnt-101',
    deploy_type: 'dockerfile',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 86400000 * 5).toLocaleDateString()
  },
  {
    id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    name: 'django-cms',
    repository: 'https://github.com/django/django',
    framework: 'Django',
    status: 'stopped',
    url: 'https://cms.xistracloud.com',
    user_id: 'user-123',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    container_id: 'cnt-202',
    deploy_type: 'git',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 86400000 * 10).toLocaleDateString()
  },
  {
    id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    name: 'golang-microservice',
    repository: 'https://github.com/golang/go',
    framework: 'Go',
    status: 'building',
    url: null,
    user_id: 'user-123',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    container_id: null,
    deploy_type: 'dockerfile',
    compose_path: null,
    lastDeploy: new Date(Date.now() - 3600000).toLocaleDateString()
  }
];

const MOCK_DASHBOARD_STATS: DashboardStats = {
  projectStats: {
    active: 4, // deployed projects
    building: 2, // building projects  
    error: 1, // failed projects
    stopped: 1 // stopped projects (django-cms)
  },
  deploymentTrend: [
    { date: '2025-09-03', deployments: 2, success: 2, failed: 0 },
    { date: '2025-09-04', deployments: 1, success: 1, failed: 0 },
    { date: '2025-09-05', deployments: 3, success: 2, failed: 1 },
    { date: '2025-09-06', deployments: 0, success: 0, failed: 0 },
    { date: '2025-09-07', deployments: 1, success: 1, failed: 0 },
    { date: '2025-09-08', deployments: 2, success: 1, failed: 1 },
    { date: '2025-09-09', deployments: 1, success: 1, failed: 0 },
    { date: '2025-09-10', deployments: 2, success: 2, failed: 0 }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'deployment',
      project: 'golang-microservice',
      message: 'Building Go microservice...',
      created_at: new Date(Date.now() - 300000).toISOString(),
      status: 'warning'
    },
    {
      id: '2',
      type: 'deployment',
      project: 'nextjs-landing-page',
      message: 'Installing dependencies...',
      created_at: new Date(Date.now() - 600000).toISOString(),
      status: 'warning'
    },
    {
      id: '3',
      type: 'error',
      project: 'express-api-gateway',
      message: 'Build failed: Missing environment variable DATABASE_URL',
      created_at: new Date(Date.now() - 900000).toISOString(),
      status: 'error'
    },
    {
      id: '4',
      type: 'deployment',
      project: 'vue-ecommerce',
      message: 'Deployment completed successfully',
      created_at: new Date(Date.now() - 1200000).toISOString(),
      status: 'success'
    },
    {
      id: '5',
      type: 'deployment',
      project: 'react-dashboard',
      message: 'Deployment completed successfully',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      status: 'success'
    }
  ]
};

const MOCK_DOMAINS: Domain[] = [
  {
    id: '1',
    domain: 'example-voting-app.xistracloud.com',
    project_id: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    project_name: 'example-voting-app',
    status: 'verified',
    ssl_status: 'active',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: '2',
    domain: 'blog-api.xistracloud.com',
    project_id: '9a3d5f2e-8b7c-4d6e-9f8g-1h2i3j4k5l6m',
    project_name: 'fastapi-blog-api',
    status: 'verified',
    ssl_status: 'active',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '3',
    domain: 'dashboard.xistracloud.com',
    project_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    project_name: 'react-dashboard',
    status: 'verified',
    ssl_status: 'active',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: '4',
    domain: 'shop.xistracloud.com',
    project_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    project_name: 'vue-ecommerce',
    status: 'verified',
    ssl_status: 'active',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString()
  },
  {
    id: '5',
    domain: 'cms.xistracloud.com',
    project_id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    project_name: 'django-cms',
    status: 'pending',
    ssl_status: 'pending',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

const MOCK_LOGS: Log[] = [
  {
    id: '1',
    project_id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
    project_name: 'golang-microservice',
    type: 'build',
    message: 'Building Go microservice with Docker...',
    created_at: new Date(Date.now() - 300000).toISOString(),
    level: 'info',
    source: 'docker'
  },
  {
    id: '2',
    project_id: 'f8275b2f-3030-4893-9473-1a10fe393092',
    project_name: 'nextjs-landing-page',
    type: 'build',
    message: 'Installing dependencies with npm...',
    created_at: new Date(Date.now() - 600000).toISOString(),
    level: 'info',
    source: 'npm'
  },
  {
    id: '3',
    project_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    project_name: 'express-api-gateway',
    type: 'error',
    message: 'Build failed: Missing environment variable DATABASE_URL',
    created_at: new Date(Date.now() - 900000).toISOString(),
    level: 'error',
    source: 'build'
  },
  {
    id: '4',
    project_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
    project_name: 'vue-ecommerce',
    type: 'deployment',
    message: 'Application deployed successfully to shop.xistracloud.com',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    level: 'info',
    source: 'docker'
  },
  {
    id: '5',
    project_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    project_name: 'react-dashboard',
    type: 'deployment',
    message: 'React application deployed successfully to dashboard.xistracloud.com',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    level: 'info',
    source: 'docker'
  },
  {
    id: '6',
    project_id: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    project_name: 'example-voting-app',
    type: 'deployment',
    message: 'Docker Compose application running successfully',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    level: 'info',
    source: 'docker'
  },
  {
    id: '7',
    project_id: '9a3d5f2e-8b7c-4d6e-9f8g-1h2i3j4k5l6m',
    project_name: 'fastapi-blog-api',
    type: 'deployment',
    message: 'FastAPI service deployed to blog-api.xistracloud.com',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    level: 'info',
    source: 'docker'
  },
  {
    id: '8',
    project_id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
    project_name: 'django-cms',
    type: 'info',
    message: 'Container stopped - awaiting restart',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    level: 'warning',
    source: 'docker'
  }
];

// API Functions
export const getProjects = async (): Promise<Project[]> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for projects');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return MOCK_PROJECTS;
  }

  try {
    console.log('🌐 Fetching projects from API:', `${API_URL}/projects`);
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Successfully fetched projects from API');
    
    // Add lastDeploy field for ProjectCard compatibility
    const projectsWithLastDeploy = data.map((project: any) => ({
      ...project,
      lastDeploy: new Date(project.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    
    return projectsWithLastDeploy;
  } catch (error) {
    console.error('❌ Error fetching projects from API, falling back to mock data:', error);
    
    // Add lastDeploy field for ProjectCard compatibility  
    const projectsWithLastDeploy = MOCK_PROJECTS.map(project => ({
      ...project,
      lastDeploy: new Date(project.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    
    return projectsWithLastDeploy;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for delete project:', projectId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Buscar el proyecto en los datos mock
    const projectIndex = MOCK_PROJECTS.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      throw new Error('Proyecto no encontrado');
    }
    
    // Eliminar el proyecto de los datos mock
    MOCK_PROJECTS.splice(projectIndex, 1);
    console.log('✅ Proyecto eliminado de datos mock');
    return;
  }

  try {
    console.log('🌐 Deleting project via API:', `${API_URL}/projects/${projectId}`);
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('✅ Successfully deleted project via API');
  } catch (error) {
    console.error('❌ Error deleting project via API:', error);
    throw error;
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for dashboard stats');
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DASHBOARD_STATS;
  }

  try {
    console.log('🌐 Fetching dashboard stats from API:', `${API_URL}/dashboard/stats`);
    const response = await fetch(`${API_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Successfully fetched dashboard stats from API:', data);
    
    // Railway now returns the correct structure - no conversion needed!
    return data;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats from API, falling back to mock data:', error);
    return MOCK_DASHBOARD_STATS;
  }
};

export const getDomains = async (): Promise<Domain[]> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for domains');
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_DOMAINS;
  }

  try {
    console.log('🌐 Fetching domains from API:', `${API_URL}/domains`);
    const response = await fetch(`${API_URL}/domains`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Successfully fetched domains from API:', data);
    console.log('🔍 Domains array:', data.domains);
    const domains = data.domains || [];
    console.log('📦 Final domains to return:', domains);
    return domains;
  } catch (error) {
    console.error('❌ Error fetching domains from API, falling back to mock data:', error);
    return MOCK_DOMAINS;
  }
};

export const getLogs = async (params?: { level?: string; limit?: number; source?: string; project?: string }): Promise<Log[]> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for logs');
    await new Promise(resolve => setTimeout(resolve, 350));
    return MOCK_LOGS;
  }

  try {
    let url = `${API_URL}/logs`;
    if (params) {
      const urlParams = new URLSearchParams();
      if (params.level) urlParams.append('level', params.level);
      if (params.limit) urlParams.append('limit', params.limit.toString());
      if (params.source) urlParams.append('source', params.source);
      if (params.project) urlParams.append('project', params.project);
      
      const paramsString = urlParams.toString();
      if (paramsString) {
        url += `?${paramsString}`;
      }
    }

    console.log('🌐 Fetching logs from API:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Successfully fetched logs from API');
    return data;
  } catch (error) {
    console.error('❌ Error fetching logs from API, falling back to mock data:', error);
    return MOCK_LOGS;
  }
};

// Domain-related functions
export const createDomain = async (domainData: { domain: string; project_id: string }): Promise<Domain> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for create domain');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newDomain: Domain = {
      id: `domain-${Date.now()}`,
      domain: domainData.domain,
      project_id: domainData.project_id,
      project_name: MOCK_PROJECTS.find(p => p.id === domainData.project_id)?.name || 'Unknown Project',
      status: 'pending',
      ssl_status: 'pending',
      created_at: new Date().toISOString()
    };
    return newDomain;
  }

  try {
    console.log('🌐 Creating domain via API:', `${API_URL}/domains`);
    console.log('🔧 API_URL value:', API_URL);
    console.log('⚙️ USE_MOCK_DATA:', USE_MOCK_DATA);
    
    // Enviar ambos formatos para compatibilidad con backend
    const requestBody = {
      domain: domainData.domain,
      project_id: domainData.project_id,
      projectId: domainData.project_id  // Duplicar para compatibilidad
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_URL}/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server response:', response.status, response.statusText, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    console.log('✅ Successfully created domain via API');
    return data;
  } catch (error) {
    console.error('❌ Error creating domain via API:', error);
    throw error;
  }
};

export const deleteDomain = async (domainId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for delete domain');
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  try {
    console.log('🌐 Deleting domain via API:', `${API_URL}/domains/${domainId}`);
    const response = await fetch(`${API_URL}/domains/${domainId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('✅ Successfully deleted domain via API');
  } catch (error) {
    console.error('❌ Error deleting domain via API:', error);
    throw error;
  }
};

export const verifyDomain = async (domainId: string): Promise<Domain> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for verify domain');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockDomain = MOCK_DOMAINS.find(d => d.id === domainId);
    if (mockDomain) {
      return {
        ...mockDomain,
        status: 'verified',
        ssl_status: 'active'
      };
    }
    throw new Error('Domain not found');
  }

  try {
    console.log('🌐 Verifying domain via API:', `${API_URL}/domains/${domainId}/verify`);
    const response = await fetch(`${API_URL}/domains/${domainId}/verify`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Successfully verified domain via API');
    return data;
  } catch (error) {
    console.error('❌ Error verifying domain via API:', error);
    throw error;
  }
};

// Redeploy project function
export const redeployProject = async (projectId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    console.log('🔄 Using mock data for redeploy project:', projectId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular tiempo de despliegue inicial
    
    // Encontrar el proyecto original
    const originalProject = MOCK_PROJECTS.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Proyecto no encontrado');
    }

    // Crear un nuevo deployment (copia del proyecto con nueva fecha y ID)
    const newDeployment: Project = {
      id: `redeploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: originalProject.name,
      repository: originalProject.repository,
      framework: originalProject.framework,
      status: 'building',
      url: originalProject.url,
      user_id: originalProject.user_id,
      created_at: new Date().toISOString(),
      container_id: originalProject.container_id,
      deploy_type: originalProject.deploy_type,
      compose_path: originalProject.compose_path,
      lastDeploy: 'Ahora mismo'
    };

    console.log('🔄 Creating new deployment with status:', newDeployment.status);

    // Agregar el nuevo deployment al inicio de la lista
    MOCK_PROJECTS.unshift(newDeployment);
    
    // Después de 3 segundos, cambiar a 'deployed' (exitoso) - SIEMPRE exitoso en mock
    setTimeout(() => {
      const deploymentIndex = MOCK_PROJECTS.findIndex(p => p.id === newDeployment.id);
      if (deploymentIndex !== -1) {
        // Forzar estado deployed para que siempre muestre "Exitoso"
        MOCK_PROJECTS[deploymentIndex].status = 'deployed';
        MOCK_PROJECTS[deploymentIndex].lastDeploy = new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log('✅ Deployment status FORCED to deployed:', MOCK_PROJECTS[deploymentIndex].status);
      }
    }, 3000);
    
    console.log('✅ New deployment created successfully (mock)');
    return;
  }

  try {
    console.log('🌐 Redeploying project via API:', `${API_URL}/projects/${projectId}/redeploy`);
    const response = await fetch(`${API_URL}/projects/${projectId}/redeploy`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('✅ Successfully redeployed project via API');
  } catch (error) {
    console.error('❌ Error redeploying project via API:', error);
    throw error;
  }
};
