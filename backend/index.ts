import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

const app = express();
const port = 3001;

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

import { supabase } from './lib/supabase';

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

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
