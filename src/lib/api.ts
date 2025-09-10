const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mock data for fallback
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
    const response = await fetch(`${API_URL}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Error al cargar los datos del dashboard');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw new Error('Error al cargar los datos del dashboard');
  }
};

export const getLogs = async (filters: LogFilters = {}): Promise<LogEntry[]> => {
  try {
    if (USE_MOCK_DATA) {
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
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error('Error al cargar los proyectos');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    throw error;
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
