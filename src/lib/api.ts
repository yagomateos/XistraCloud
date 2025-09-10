const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
    const params = new URLSearchParams();
    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.deployment_id) params.append('deployment_id', filters.deployment_id);
    if (filters.level) params.append('level', filters.level);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/logs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al cargar los logs');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener logs:', error);
    throw new Error('Error al cargar los logs');
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
    const response = await fetch(`${API_URL}/domains`);
    if (!response.ok) {
      throw new Error('Error al cargar los dominios');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener dominios:', error);
    throw new Error('Error al cargar los dominios');
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
