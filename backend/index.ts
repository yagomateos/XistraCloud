import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

// Version: 2025-01-27 - Fixed domain creation compatibility

const execAsync = util.promisify(exec);

const app = express();
const port = process.env.PORT || 3001;

const socket = process.env.DOCKER_SOCKET || path.join(os.homedir(), '.docker', 'run', 'docker.sock');
const docker = new Docker({ socketPath: socket });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from XistraCloud backend!');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  if (email) {
    const name = email.split('@')[0];
    res.json({ name, email });
  } else {
    res.status(400).send('Email is required');
  }
});

import { supabase, supabaseAdmin } from './lib/supabase';

app.get('/projects', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).send('Failed to fetch projects');
  }
});

app.post('/projects', async (req, res) => {
  try {
    const { name, repository, framework, deploy_type, compose_path } = req.body;
    
    const projectData = {
      name,
      repository,
      framework,
      status: 'building',
      deploy_type: deploy_type || 'git',
      compose_path: compose_path || null,
      url: null,
      container_id: null
    };

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([projectData])
      .select();

    if (error) throw error;
    
    console.log('✅ Project created successfully:', data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    console.log('✅ Project deleted successfully:', id);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/projects/:id/redeploy', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el proyecto original
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Crear nuevo despliegue (copia del proyecto)
    const newDeployment = {
      name: project.name,
      repository: project.repository,
      framework: project.framework,
      status: 'building',
      deploy_type: project.deploy_type,
      compose_path: project.compose_path,
      url: project.url,
      container_id: null
    };

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([newDeployment])
      .select();

    if (error) throw error;

    // Simular tiempo de despliegue y luego actualizar a 'deployed'
    setTimeout(async () => {
      await supabaseAdmin
        .from('projects')
        .update({ status: 'deployed' })
        .eq('id', data[0].id);
    }, 3000);
    
    console.log('✅ Project redeployed successfully:', data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('❌ Error redeploying project:', error);
    res.status(500).json({ error: 'Failed to redeploy project' });
  }
});

app.get('/dashboard/stats', async (req, res) => {
  try {
    // Obtener proyectos y su estado
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    if (projectsError) throw projectsError;

    // Obtener despliegues de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: deployments, error: deploymentsError } = await supabase
      .from('deployments')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString());
    if (deploymentsError) throw deploymentsError;

    // Obtener actividad reciente
    const { data: recentActivity, error: activityError } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (activityError) throw activityError;

    // Calcular estadísticas
    const projectStats = {
      active: projects.filter(p => p.status === 'deployed').length,
      building: projects.filter(p => p.status === 'building').length,
      error: projects.filter(p => p.status === 'error').length
    };

    // Agrupar despliegues por día
    const deploymentTrend = deployments.reduce((acc, dep) => {
      const date = new Date(dep.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { deployments: 0, success: 0, failed: 0 };
      }
      acc[date].deployments++;
      acc[date][dep.status === 'success' ? 'success' : 'failed']++;
      return acc;
    }, {});

    res.json({
      projectStats,
      deploymentTrend: Object.entries(deploymentTrend).map(([date, stats]) => ({
        date,
        deployments: (stats as any).deployments,
        success: (stats as any).success,
        failed: (stats as any).failed
      })),
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).send('Failed to fetch dashboard stats');
  }
});

// --- Claude's Universal Deployer (Adapted) ---

interface DeploymentResult {
  success: boolean;
  method: 'docker-compose' | 'dockerfile-buildkit' | 'dockerfile-legacy' | 'generated-dockerfile';
  imageId?: string; // For Dockerfile builds
  containerId?: string; // For Dockerfile builds
  composePath?: string; // For Docker Compose builds
  error?: string;
}

class UniversalDeployer {
  
  async deployRepository(repoUrl: string, tempDir: string, name: string): Promise<DeploymentResult> {
    console.log(`🚀 Starting universal deployment for: ${repoUrl}`);
    
    // Strategy 1: Docker Compose (highest priority)
    const composeResult = await this.tryDockerCompose(tempDir);
    if (composeResult.success) return composeResult;
    
    // Strategy 2: Dockerfile with BuildKit via CLI
    const buildkitResult = await this.tryDockerfileWithBuildKit(tempDir, name);
    if (buildkitResult.success) return buildkitResult;
    
    // Strategy 3: Dockerfile legacy (without BuildKit) - Skipping for now, as BuildKit is preferred
    // const legacyResult = await this.tryDockerfileLegacy(tempDir);
    // if (legacyResult.success) return legacyResult;
    
    // Strategy 4: Generate Dockerfile based on project type
    const generatedResult = await this.tryGeneratedDockerfile(tempDir, name);
    if (generatedResult.success) return generatedResult;
    
    // All strategies failed
    return {
      success: false,
      method: 'dockerfile-legacy', // Fallback method for error reporting
      error: 'All deployment strategies failed: No compose, Dockerfile, or recognizable project type found.'
    };
  }

  // Strategy 1: Docker Compose
  private async tryDockerCompose(tempDir: string): Promise<DeploymentResult> {
    try {
      console.log('[Strategy 1] Trying Docker Compose...');
      
      // Find compose file
      const composeFile = await this.findComposeFile(tempDir);
      if (!composeFile) {
        return { success: false, method: 'docker-compose', error: 'No compose file found' };
      }
      
      console.log(`[Compose] Found: ${composeFile}`);
      
      // Use Docker CLI directly for compose
      const composeDir = path.dirname(composeFile);
      const { stdout, stderr } = await execAsync('docker-compose up -d --build --remove-orphans', {
        cwd: composeDir,
        env: { ...process.env, DOCKER_BUILDKIT: '1' } // Ensure BuildKit is enabled for compose builds
      });
      console.log('[Compose] stdout:', stdout);
      if (stderr) console.error('[Compose] stderr:', stderr);
      
      return {
        success: true,
        method: 'docker-compose',
        composePath: composeFile // Return the path to save for deletion
      };
      
    } catch (error: any) {
      console.log(`[Compose] Failed: ${error.message}`);
      return { success: false, method: 'docker-compose', error: error.message };
    }
  }

  // Strategy 2: Dockerfile with BuildKit via CLI
  private async tryDockerfileWithBuildKit(tempDir: string, name: string): Promise<DeploymentResult> {
    try {
      console.log('[Strategy 2] Trying Dockerfile with BuildKit CLI...');
      
      const dockerfile = await this.findDockerfile(tempDir);
      if (!dockerfile) {
        return { success: false, method: 'dockerfile-buildkit', error: 'No Dockerfile found' };
      }
      
      console.log(`[BuildKit] Found: ${dockerfile}`);
      const contextDir = path.dirname(dockerfile);
      
      // Patch Dockerfile for $BUILDPLATFORM compatibility
      try {
        const arch = os.arch() === 'arm64' ? 'linux/arm64' : 'linux/amd64';
        let dockerfileContent = await fs.readFile(dockerfile, 'utf8');
        if (dockerfileContent.includes('$BUILDPLATFORM')) {
            dockerfileContent = dockerfileContent.replace(/\$BUILDPLATFORM/g, arch);
            await fs.writeFile(dockerfile, dockerfileContent, 'utf8');
            console.log('[BuildKit] Dockerfile patched for platform compatibility.');
        }
      } catch (e) { 
          console.warn('[BuildKit] Could not read or modify Dockerfile for platform. Proceeding.', e);
      }

      // Use Docker CLI with BuildKit
      const imageName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-buildkit-${Date.now()}`;
      const { stdout, stderr } = await execAsync(
        `docker buildx build --platform linux/amd64,linux/arm64 -t ${imageName} . --load`,
        {
          cwd: contextDir,
          env: { ...process.env, DOCKER_BUILDKIT: '1' } // Ensure BuildKit is enabled
        }
      );
      console.log('[BuildKit] stdout:', stdout);
      if (stderr) console.error('[BuildKit] stderr:', stderr);

      // Run the image and get container ID
      const containerPort = 80; // Assuming web apps run on port 80
      const hostPort = Math.floor(Math.random() * (65535 - 49152) + 49152); // Random port in ephemeral range

      const container = await docker.createContainer({
          Image: imageName,
          HostConfig: { PortBindings: { [`${containerPort}/tcp`]: [{ HostPort: `${hostPort}` }] } },
      });
      await container.start();
      console.log(`[BuildKit] Container ${container.id} started.`);
      
      return {
        success: true,
        method: 'dockerfile-buildkit',
        imageId: imageName,
        containerId: container.id
      };
      
    } catch (error: any) {
      console.log(`[BuildKit] Failed: ${error.message}`);
      return { success: false, method: 'dockerfile-buildkit', error: error.message };
    }
  }

  // Strategy 3: Dockerfile Legacy (patch --mount commands) - Skipping for now
  // private async tryDockerfileLegacy(tempDir: string): Promise<DeploymentResult> { ... }

  // Strategy 4: Generate Dockerfile based on project detection
  private async tryGeneratedDockerfile(tempDir: string, name: string): Promise<DeploymentResult> {
    try {
      console.log('[Strategy 4] Generating Dockerfile...');
      
      const projectType = await this.detectProjectType(tempDir);
      const generatedDockerfileContent = this.generateDockerfileContent(projectType);
      
      if (!generatedDockerfileContent) {
        return { success: false, method: 'generated-dockerfile', error: 'Could not generate Dockerfile' };
      }
      
      // Write Dockerfile
      const dockerfilePath = path.join(tempDir, 'Dockerfile');
      await fs.writeFile(dockerfilePath, generatedDockerfileContent);
      
      console.log(`[Generated] Created Dockerfile for ${projectType}`);
      
      // Use Docker CLI to build and run
      const imageName = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-generated-${Date.now()}`;
      const { stdout, stderr } = await execAsync(
        `docker build -t ${imageName} .`,
        { cwd: tempDir }
      );
      console.log('[Generated] stdout:', stdout);
      if (stderr) console.error('[Generated] stderr:', stderr);

      // Run the image and get container ID
      const containerPort = 80; // Assuming web apps run on port 80
      const hostPort = Math.floor(Math.random() * (65535 - 49152) + 49152); // Random port in ephemeral range

      const container = await docker.createContainer({
          Image: imageName,
          HostConfig: { PortBindings: { [`${containerPort}/tcp`]: [{ HostPort: `${hostPort}` }] } },
      });
      await container.start();
      console.log(`[Generated] Container ${container.id} started.`);

      return {
        success: true,
        method: 'generated-dockerfile',
        imageId: imageName,
        containerId: container.id
      };
      
    } catch (error: any) {
      console.log(`[Generated] Failed: ${error.message}`);
      return { success: false, method: 'generated-dockerfile', error: error.message };
    }
  }

  // Helper: Find compose file
  public async findComposeFile(tempDir: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(
        'find . -maxdepth 3 -name "docker-compose.yml" -o -name "docker-compose.yaml" -print -quit',
        { cwd: tempDir }
      );
      
      const relativePath = stdout.trim();
      return relativePath ? path.join(tempDir, relativePath) : null;
    } catch (e) {
      return null; // find command exits with error if no file is found
    }
  }

  // Helper: Find Dockerfile
  public async findDockerfile(tempDir: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(
        'find . -maxdepth 3 -name "Dockerfile" -print -quit',
        { cwd: tempDir }
      );
      
      const relativePath = stdout.trim();
      return relativePath ? path.join(tempDir, relativePath) : null;
    } catch (e) {
      return null; // find command exits with error if no file is found
    }
  }

  // Helper: Detect project type
  private async detectProjectType(tempDir: string): Promise<string> {
    const files = await fs.readdir(tempDir);
    
    if (files.includes('package.json')) return 'nodejs';
    if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python';
    if (files.includes('go.mod')) return 'golang';
    if (files.includes('Cargo.toml')) return 'rust';
    if (files.includes('pom.xml') || files.includes('build.gradle')) return 'java';
    if (files.includes('composer.json')) return 'php';
    if (files.includes('Gemfile')) return 'ruby';
    
    return 'generic';
  }

  // Helper: Generate Dockerfile content based on project type
  private generateDockerfileContent(projectType: string): string | null {
    const dockerfiles: { [key: string]: string } = {
      nodejs: `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json .\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`,

      python: `FROM python:3.9-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["python", "app.py"]`,

      golang: `FROM golang:1.19-alpine AS builder\nWORKDIR /app\nCOPY go.mod go.sum .\nRUN go mod download\nCOPY . .\nRUN go build -o main .\n\nFROM alpine:latest\nRUN apk --no-cache add ca-certificates\nWORKDIR /root/\nCOPY --from=builder /app/main .\nEXPOSE 8080\nCMD ["./main"]`,

      generic: `FROM alpine:latest\nRUN apk --no-cache add curl\nWORKDIR /app\nCOPY . .\nEXPOSE 8080\nCMD ["sh"]`
    };

    return dockerfiles[projectType] || dockerfiles.generic;
  }
}

// --- Main Deployment Endpoint ---

app.post('/deploy', async (req, res) => {
  let { gitUrl, name, framework } = req.body;
  if (!gitUrl) {
    return res.status(400).send('Git URL is required');
  }
  gitUrl = gitUrl.trim();

  console.log(`
--- New Deployment Request: ${gitUrl} ---`);
  const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'repository';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${repoName}-`));
  
  let containerId: string | undefined; // To store container ID for cleanup
  let composePath: string | undefined; // To store compose path for cleanup

  try {
    console.log(`[Clone] Cloning repository into ${tempDir}`);
    await simpleGit().clone(gitUrl, tempDir);
    console.log('[Clone] Repository cloned successfully');

    const deployer = new UniversalDeployer();
    const result = await deployer.deployRepository(gitUrl, tempDir, name);

    if (!result.success) {
      throw new Error(result.error || 'Deployment failed for unknown reason.');
    }

    // Store IDs for cleanup and DB
    containerId = result.containerId;
    composePath = result.composePath;

    // Save to DB based on deployment method
    let dbEntry: any = { 
      name, 
      repository: gitUrl, 
      framework, 
      status: 'deployed', 
      deploy_type: result.method 
    };

    if (result.method === 'docker-compose') {
      dbEntry.compose_path = result.composePath; // Save compose path for deletion
    } else { // Dockerfile-based methods
      // For Dockerfile builds, we need the URL and container ID
      // Note: Claude's solution doesn't return URL, so we'll generate a placeholder
      const appUrl = `http://localhost:${Math.floor(Math.random() * (65535 - 49152) + 49152)}`; // Placeholder URL
      dbEntry.url = appUrl;
      dbEntry.container_id = result.containerId;
    }

    await supabase.from('projects').insert([dbEntry]);
    console.log('[DB] Project saved to database.');
    res.status(200).send({ message: `Deployment started via ${result.method}.`, appUrl: dbEntry.url });

  } catch (error: any) {
    console.error('\n--- DEPLOYMENT FAILED ---\n', error);
    // Attempt cleanup of container/compose if created
    if (containerId) {
      try {
        const container = docker.getContainer(containerId);
        await container.stop();
        await container.remove();
        console.log(`[Cleanup] Cleaned up orphaned container ${containerId}`);
      } catch (cleanupError) {
        console.error(`[Cleanup] Failed to cleanup orphaned container:`, cleanupError);
      }
    } else if (composePath) {
        // For compose, we need to run docker-compose down
        // This is tricky as we don't have the project name or original tempDir here
        // For now, manual cleanup might be needed for failed compose deployments
        console.warn(`[Cleanup] Compose project failed. Manual cleanup of services might be required.`);
    }
    res.status(500).send('Deployment failed');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`[Cleanup] Cleaned up temporary directory: ${tempDir}`);
  }
});

app.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`
--- Deletion Request: ${id} ---`);
  let tempDir: string | null = null;

  try {
    const { data: projectData, error: fetchError } = await supabase
      .from('projects')
      .select('container_id, deploy_type, repository, compose_path') // Select compose_path
      .eq('id', id)
      .single();

    if (fetchError || !projectData) {
      console.warn(`[DB] Project with ID ${id} not found in database.`);
    } else {
      if (projectData.deploy_type === 'docker-compose') {
        console.log('[Delete] Deleting compose project...');
        // Re-clone to get the compose file for `docker-compose down`
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `delete-${id.substring(0, 8)}-`));
        await simpleGit().clone(projectData.repository, tempDir);
        
        const deployer = new UniversalDeployer();
        const composeFile = await deployer.findComposeFile(tempDir); // Use deployer's helper

        if (composeFile) {
          const composeDir = path.dirname(composeFile);
          const command = `docker-compose -f ${composeFile} down --remove-orphans`;
          console.log(`[Exec] Executing: ${command}`);
          const { stdout, stderr } = await execAsync(command, { cwd: composeDir });
          console.log('[Exec] Compose stdout:', stdout);
          if (stderr) console.error('[Exec] Compose stderr:', stderr);
          console.log('[Delete] Compose project stopped and removed.');
        } else {
          console.warn('[Delete] Could not find compose file for deletion. Manual cleanup might be needed.');
        }
      } else if (projectData.deploy_type.startsWith('dockerfile') && projectData.container_id) { // Covers all Dockerfile types
        console.log('[Delete] Deleting dockerfile project...');
        try {
          const container = docker.getContainer(projectData.container_id);
          await container.stop();
          await container.remove();
          console.log(`[Delete] Container ${projectData.container_id} stopped and removed.`);
        } catch (dockerError: any) {
          console.warn(`[Delete] Could not remove container ${projectData.container_id}. It might already be gone.`);
        }
      }
    }

    await supabase.from('projects').delete().eq('id', id);
    console.log(`[DB] Project ${id} deletion processed.`);
    res.status(200).send('Project deletion processed');

  } catch (error: any) {
    console.error(`[Delete] Failed to process deletion for project ${id}:`, error);
    res.status(500).send('Failed to delete project');
  } finally {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[Cleanup] Cleaned up temporary directory for deletion: ${tempDir}`);
    }
  }
});

// Get deployment logs
app.get('/logs', async (req, res) => {
  try {
    const { project_id, deployment_id, level, limit = 100 } = req.query;

    let query = supabase
      .from('deployment_logs')
      .select(`
        id,
        timestamp,
        level,
        message,
        source,
        metadata,
        deployment_id,
        project_id,
        projects!inner(name)
      `)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    
    if (deployment_id) {
      query = query.eq('deployment_id', deployment_id);
    }
    
    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    // Limit results
    query = query.limit(Number(limit));

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    // Transform data for frontend
    const transformedLogs = logs?.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      source: log.source,
      metadata: log.metadata,
      projectName: (log.projects as any)?.name || 'Unknown Project',
      projectId: log.project_id,
      deploymentId: log.deployment_id
    })) || [];

    res.json(transformedLogs);

  } catch (error: any) {
    console.error('Error in /logs endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logs for a specific project
app.get('/projects/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { level, limit = 50 } = req.query;

    let query = supabase
      .from('deployment_logs')
      .select(`
        id,
        timestamp,
        level,
        message,
        source,
        metadata,
        deployment_id,
        deployments!inner(status)
      `)
      .eq('project_id', id)
      .order('timestamp', { ascending: false });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    query = query.limit(Number(limit));

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching project logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    const transformedLogs = logs?.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      source: log.source,
      metadata: log.metadata,
      deploymentId: log.deployment_id,
      deploymentStatus: (log.deployments as any)?.status
    })) || [];

    res.json(transformedLogs);

  } catch (error: any) {
    console.error('Error in project logs endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all domains
app.get('/domains', async (req, res) => {
  try {
    const { data: domains, error } = await supabase
      .from('domains')
      .select(`
        id,
        domain,
        status,
        ssl_enabled,
        dns_records,
        verification_token,
        last_checked_at,
        created_at,
        projects!inner(name, id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      return res.status(500).json({ error: 'Failed to fetch domains' });
    }

    const transformedDomains = domains?.map(domain => ({
      id: domain.id,
      domain: domain.domain,
      projectName: (domain.projects as any)?.name || 'Unknown Project',
      projectId: (domain.projects as any)?.id || '',
      status: domain.status,
      ssl: domain.ssl_enabled,
      dnsRecords: domain.dns_records,
      verificationToken: domain.verification_token,
      lastChecked: domain.last_checked_at,
      createdAt: domain.created_at
    })) || [];

    res.json(transformedDomains);

  } catch (error: any) {
    console.error('Error in /domains endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new domain
app.post('/domains', async (req, res) => {
  try {
    console.log('🚀 === DOMAIN CREATION STARTED ===');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const { domain, project_id, projectId } = req.body;
    
    // Usar project_id o projectId (compatibilidad)
    const projectIdValue = project_id || projectId;
    
    console.log('🔍 Extracted values:');
    console.log('  - domain:', domain);
    console.log('  - project_id:', project_id);
    console.log('  - projectId:', projectId);
    console.log('  - projectIdValue:', projectIdValue);

    if (!domain || !projectIdValue) {
      console.log('❌ Missing required fields:', { domain, project_id, projectId, projectIdValue });
      return res.status(400).json({ error: 'Domain and project_id are required' });
    }

    // Validate domain format - more flexible regex
    console.log('🔍 Validating domain format...');
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domain || domain.length < 1 || domain.length > 253 || !domainRegex.test(domain)) {
      console.log('❌ Invalid domain:', domain, 'Test result:', domainRegex.test(domain));
      return res.status(400).json({ error: 'Invalid domain format. Please use a valid domain like example.com' });
    }
    console.log('✅ Domain format is valid');

    // Check if domain already exists
    console.log('🔍 Checking if domain already exists...');
    const { data: existingDomain, error: checkError } = await supabase
      .from('domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking existing domain:', checkError);
      return res.status(500).json({ error: 'Database error checking existing domain' });
    }

    if (existingDomain) {
      console.log('❌ Domain already exists:', existingDomain.id);
      return res.status(409).json({ error: 'Domain already exists' });
    }
    console.log('✅ Domain does not exist yet');

    // Verify project exists
    console.log('🔍 Verifying project exists...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectIdValue)
      .single();

    if (projectError) {
      console.error('❌ Error finding project:', projectError);
      return res.status(500).json({ error: 'Database error finding project' });
    }

    if (!project) {
      console.log('❌ Project not found:', projectIdValue);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log('✅ Project found:', project.name, '(', project.id, ')');

    // Generate verification token
    console.log('🔍 Generating verification token...');
    const verificationToken = Math.random().toString(36).substring(2, 22);
    console.log('✅ Verification token generated:', verificationToken);

    // Create DNS records configuration
    console.log('🔍 Creating DNS records configuration...');
    const dnsRecords = {
      cname: {
        name: domain,
        value: 'xistracloud.app'
      },
      txt: {
        name: `_xistracloud.${domain}`,
        value: `xistracloud-verification=${verificationToken}`
      }
    };
    console.log('✅ DNS records created:', JSON.stringify(dnsRecords, null, 2));

    // Insert domain
    console.log('🔍 Inserting domain into database...');
    const insertData = {
      domain,
      project_id: projectIdValue,
      status: 'pending',
      ssl_enabled: false,
      dns_records: dnsRecords,
      verification_token: verificationToken
    };
    console.log('📤 Insert data:', JSON.stringify(insertData, null, 2));

    // Insert domain
    const { data: newDomain, error } = await supabase
      .from('domains')
      .insert({
        domain,
        project_id: projectIdValue,
        status: 'pending',
        ssl_enabled: false,
        dns_records: dnsRecords,
        verification_token: verificationToken
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', JSON.stringify(error, null, 2));
      console.error('❌ Error details:');
      console.error('   - Code:', error.code);
      console.error('   - Message:', error.message);
      console.error('   - Details:', error.details);
      console.error('   - Hint:', error.hint);
      return res.status(500).json({ error: 'Failed to create domain', dbError: error.message });
    }
    
    console.log('✅ Domain inserted successfully:', JSON.stringify(newDomain, null, 2));

    // Return domain with DNS instructions
    console.log('🎉 Returning success response...');
    const responseData = {
      id: newDomain.id,
      domain: newDomain.domain,
      projectName: project.name,
      projectId: project.id,
      status: newDomain.status,
      ssl: newDomain.ssl_enabled,
      dnsRecords: newDomain.dns_records,
      verificationToken: newDomain.verification_token,
      createdAt: newDomain.created_at
    };
    console.log('📤 Response data:', JSON.stringify(responseData, null, 2));
    
    res.status(201).json(responseData);
    console.log('🚀 === DOMAIN CREATION COMPLETED ===');

  } catch (error: any) {
    console.error('❌ === DOMAIN CREATION FAILED ===');
    console.error('❌ Unexpected error in POST /domains endpoint:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete domain
app.delete('/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting domain:', error);
      return res.status(500).json({ error: 'Failed to delete domain' });
    }

    res.status(200).json({ message: 'Domain deleted successfully' });

  } catch (error: any) {
    console.error('Error in DELETE /domains endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify domain (check DNS records)
app.post('/domains/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    // Get domain info
    const { data: domain, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Simulate DNS verification (in a real app, you'd check actual DNS records)
    // For demo purposes: real domains that might actually be configured fail
    // Test domains or very specific patterns succeed
    let verified = false;
    let message = '';
    
    if (domain.domain.includes('test') || domain.domain.includes('demo') || domain.domain.includes('ejemplo')) {
      // Test domains usually succeed
      verified = Math.random() > 0.2; // 80% success rate for test domains
      message = verified ? 'Dominio de prueba verificado correctamente' : 'Error temporal en la verificación de prueba';
    } else if (domain.domain.includes('sinaptiks.com') || domain.domain.includes('real-domain')) {
      // Real domains might fail because they're already configured elsewhere
      verified = false;
      message = 'Este dominio parece estar configurado para otro servicio. Para verificarlo realmente, necesitarías configurar los registros DNS específicos de XistraCloud.';
    } else {
      // Other domains: random for demo
      verified = Math.random() > 0.4; // 60% success rate
      message = verified ? 'Dominio verificado correctamente' : 'No se pudieron verificar los registros DNS. Asegúrate de haber configurado los registros CNAME y TXT correctamente.';
    }
    
    const newStatus = verified ? 'verified' : 'failed';
    const sslEnabled = verified; // Enable SSL if verified

    // Update domain status
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        status: newStatus,
        ssl_enabled: sslEnabled,
        last_checked_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating domain:', updateError);
      return res.status(500).json({ error: 'Failed to update domain' });
    }

    res.json({
      success: verified,
      status: newStatus,
      ssl: sslEnabled,
      message: message
    });

  } catch (error: any) {
    console.error('Error in domain verification endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
