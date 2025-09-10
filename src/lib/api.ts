const API_URL = 'http://localhost:3001';

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
