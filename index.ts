export type ProjectStatus = 'active' | 'building' | 'error';
export type DeploymentStatus = 'success' | 'failed' | 'building' | 'deployed';
export type ActivityType = 'deployment' | 'domain' | 'error' | 'info';
export type ActivityStatus = 'success' | 'error' | 'warning' | 'info';
export type DomainStatus = 'verified' | 'pending' | 'failed';

export interface Project {
  id: string;
  name: string;
  repository: string;
  framework: string;
  status: DeploymentStatus;
  lastDeploy: string;
  url?: string;
}

export interface Domain {
  id: string;
  domain: string;
  projectName: string;
  projectId: string;
  status: DomainStatus;
  ssl: boolean;
  createdAt: string;
}

export interface Deployment {
  id: string;
  projectName: string;
  projectId: string;
  status: 'success' | 'failed' | 'building';
  createdAt: string;
  duration: string;
  url?: string;
  branch: string;
  commit: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  projectName: string;
  projectId: string;
  deploymentId: string;
}

export interface RecentActivity {
  id: string;
  type: ActivityType;
  project: string;
  message: string;
  time: string;
  status: ActivityStatus;
}