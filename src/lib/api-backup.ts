// Types and interfaces
export interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
  url?: string | null;
  repository: string;
  framework: string;
  user_id?: string;
  container_const MOCK_DOMAINS: Domain[] = [
  {
    id: '1',
    domain: 'app.xistracloud.com',
    project_id: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    project_name: 'example-voting-app',
    status: 'verified',
    ssl_status: 'active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '2',
    domain: 'demo.xistracloud.app',
    project_id: 'f8275b2f-3030-4893-9473-1a10fe393092',
    project_name: 'nextjs-landing-page',
    status: 'pending',
    ssl_status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }  deploy_type?: string;
  compose_path?: string | null;
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
  id: string;
  project_id: string;
  project_name: string;
  type: string;
  message: string;
  created_at: string;
  level: string;
  source: string;
}

export interface DashboardStats {
  projectStats: {
    active: number;
    building: number;
    error: number;
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Debug logs
console.log('🔧 DEBUG - API Configuration:');
console.log('  API_URL:', API_URL);
console.log('  VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('  USE_MOCK_DATA:', USE_MOCK_DATA);

// Mock data for fallback
const MOCK_PROJECTS: Project[] = [
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
    compose_path: './docker-compose.yml'
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
    compose_path: null
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
    compose_path: null
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
    compose_path: null
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
    compose_path: null
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
    compose_path: null
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
    compose_path: null
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
    compose_path: null
  }
];

const MOCK_DASHBOARD_STATS: DashboardStats = {
  projectStats: {
    active: 1,
    building: 1,
    error: 0
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
      project: 'example-voting-app',
      message: 'Deployment completed successfully',
      created_at: new Date(Date.now() - 300000).toISOString(),
      status: 'success'
    },
    {
      id: '2',
      type: 'domain',
      project: 'landing-page',
      message: 'Domain verification pending',
      created_at: new Date(Date.now() - 600000).toISOString(),
      status: 'warning'
    },
    {
      id: '3',
      type: 'error',
      project: 'blog-api',
      message: 'Build failed: Missing environment variable',
      created_at: new Date(Date.now() - 900000).toISOString(),
      status: 'error'
    }
  ]
};

const MOCK_DOMAINS: Domain[] = [
  {
    id: '1',
    domain: 'app.xistracloud.com',
    projectId: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    projectName: 'example-voting-app',
    status: 'verified',
    ssl: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastChecked: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    domain: 'demo.xistracloud.app',
    projectId: 'f8275b2f-3030-4893-9473-1a10fe393092',
    projectName: 'landing-page',
    status: 'pending',
    ssl: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'info',
    message: 'Aplicación desplegada exitosamente',
    source: 'deployment',
    metadata: { duration: '2m15s' },
    projectName: 'example-voting-app',
    projectId: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    deploymentId: 'dep-1',
    deploymentStatus: 'success'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'success',
    message: 'SSL certificado configurado para app.xistracloud.com',
    source: 'ssl',
    metadata: { domain: 'app.xistracloud.com' },
    projectName: 'example-voting-app',
    projectId: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    deploymentId: 'dep-1',
    deploymentStatus: 'success'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'warning',
    message: 'Uso de CPU elevado detectado: 78%',
    source: 'monitor',
    metadata: { cpu: '78%', memory: '45%' },
    projectName: 'example-voting-app',
    projectId: 'eeea1aeb-1cb8-4559-976c-a0816f75feca',
    deploymentId: 'dep-1',
    deploymentStatus: 'running'
  }
];

export interface Project {
  id: string;
  name: string;
  repository: string;
  framework: string;
  status: string;
  url: string | null;
  user_id: string | null;
  created_at: string;
  container_id: string | null;
  deploy_type: string | null;
  compose_path: string | null;
}

export interface ProjectStats {
  active: number;
  building: number;
  error: number;
}

export interface DeploymentTrendItem {
  date: string;
  deployments: number;
  success: number;
  failed: number;
}

export interface ActivityItem {
  id: string;
  type: 'deployment' | 'domain' | 'error' | string;
  project: string;
  message: string;
  created_at: string;
  status: 'success' | 'error' | 'warning' | string;
}

export interface DashboardStats {
  projectStats: ProjectStats;
  deploymentTrend: DeploymentTrendItem[];
  recentActivity: ActivityItem[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  source: string;
  metadata?: any;
  projectName?: string;
  projectId: string;
  deploymentId: string;
  deploymentStatus?: string;
}

export interface LogFilters {
  project_id?: string;
  deployment_id?: string;
  level?: string;
  limit?: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    if (USE_MOCK_DATA) {
      return MOCK_DASHBOARD_STATS;
    }
    
    const response = await fetch(`${API_URL}/dashboard/stats`);
    if (!response.ok) {
      console.warn('API fallback: usando datos mock para dashboard');
      return MOCK_DASHBOARD_STATS;
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    console.warn('API fallback: usando datos mock para dashboard');
    return MOCK_DASHBOARD_STATS;
  }
};

export const getLogs = async (filters: LogFilters = {}): Promise<LogEntry[]> => {
  try {
    console.log('🔧 DEBUG - getLogs called with USE_MOCK_DATA:', USE_MOCK_DATA);
    
    if (USE_MOCK_DATA) {
      console.log('🔧 DEBUG - Returning mock logs:', MOCK_LOGS.length, 'entries');
      return MOCK_LOGS;
    }
    
    const params = new URLSearchParams();
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.deployment_id) params.append('deployment_id', filters.deployment_id);
    if (filters.level) params.append('level', filters.level);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/logs?${params.toString()}`);
    if (!response.ok) {
      console.warn('API fallback: usando datos mock para logs');
      return MOCK_LOGS;
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener logs:', error);
    console.warn('API fallback: usando datos mock para logs');
    return MOCK_LOGS;
  }
};

export const getProjectLogs = async (projectId: string, filters: Omit<LogFilters, 'project_id'> = {}): Promise<LogEntry[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.level) params.append('level', filters.level);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/projects/${projectId}/logs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al cargar los logs del proyecto');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener logs del proyecto:', error);
    throw new Error('Error al cargar los logs del proyecto');
  }
};

export interface Domain {
  id: string;
  domain: string;
  projectName: string;
  projectId: string;
  status: 'verified' | 'pending' | 'failed';
  ssl: boolean;
  dnsRecords?: any;
  verificationToken?: string;
  lastChecked?: string;
  createdAt: string;
}

export interface CreateDomainRequest {
  domain: string;
  projectId: string;
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    if (USE_MOCK_DATA) {
      return MOCK_PROJECTS;
    }
    
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      console.warn('API fallback: usando datos mock para proyectos');
      return MOCK_PROJECTS;
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    console.warn('API fallback: usando datos mock para proyectos');
    return MOCK_PROJECTS;
  }
};

export const getDomains = async (): Promise<Domain[]> => {
  try {
    if (USE_MOCK_DATA) {
      return MOCK_DOMAINS;
    }
    
    const response = await fetch(`${API_URL}/domains`);
    if (!response.ok) {
      console.warn('API fallback: usando datos mock para dominios');
      return MOCK_DOMAINS;
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener dominios:', error);
    console.warn('API fallback: usando datos mock para dominios');
    return MOCK_DOMAINS;
  }
};

export const createDomain = async (domainData: CreateDomainRequest): Promise<Domain> => {
  try {
    const response = await fetch(`${API_URL}/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(domainData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el dominio');
    }

    return response.json();
  } catch (error) {
    console.error('Error al crear dominio:', error);
    throw error;
  }
};

export const deleteDomain = async (domainId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/domains/${domainId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el dominio');
    }
  } catch (error) {
    console.error('Error al eliminar dominio:', error);
    throw new Error('Error al eliminar el dominio');
  }
};

export const verifyDomain = async (domainId: string): Promise<{ success: boolean; status: string; ssl: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/domains/${domainId}/verify`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error al verificar el dominio');
    }

    return response.json();
  } catch (error) {
    console.error('Error al verificar dominio:', error);
    throw new Error('Error al verificar el dominio');
  }
};
