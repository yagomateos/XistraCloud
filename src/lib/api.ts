const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

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
