import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import Docker from 'dockerode';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const app = express();
const port = 3001;

// Docker socket path for macOS
const socket = process.env.DOCKER_SOCKET || path.join(os.homedir(), '.docker', 'run', 'docker.sock');
const docker = new Docker({ socketPath: socket });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from XistraCloud backend!');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // TODO: Implement real authentication logic here
  console.log('Login attempt:', { email, password });

  if (email) {
    const name = email.split('@')[0];
    res.json({ name, email });
  } else {
    res.status(400).send('Email is required');
  }
});

import { supabase } from './lib/supabase';

app.post('/deploy', async (req, res) => {
  const { gitUrl, name, framework } = req.body;
  if (!gitUrl) {
    return res.status(400).send('Git URL is required');
  }

  console.log(`Deployment request for ${gitUrl}`);

  const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'repository';
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${repoName}-`));

  try {
    console.log(`Cloning repository into ${tempDir}`);
    const git = simpleGit();
    await git.clone(gitUrl, tempDir);
    console.log('Repository cloned successfully');

    const imageName = repoName.toLowerCase();
    console.log(`Building Docker image: ${imageName}`);

    const contextPath = gitUrl === 'https://github.com/dockersamples/example-voting-app' ? path.join(tempDir, 'vote') : tempDir;
    const dockerfilePath = 'Dockerfile'; // Dockerfile is now relative to the contextPath

    console.log(`Docker build context: ${contextPath}`);
    console.log(`Dockerfile path (relative to context): ${dockerfilePath}`);
    console.log('Contents of context path:', await fs.readdir(contextPath));

    const stream = await docker.buildImage(
      {
        context: contextPath,
        src: ['.'], // Send the entire context
      },
      { t: imageName }
    );

    let imageId: string | undefined;
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null, output: any) => {
        if (err) return reject(err);
        if (output.error) return reject(new Error(output.error));

        console.log('Docker build output:', output);

        // Parse the output to find the image ID
        if (output.stream) {
          const match = output.stream.match(/Successfully built ([a-f0-9]+)/);
          if (match && match[1]) {
            imageId = match[1];
          }
        }
        resolve(); // Resolve after each chunk, or after the final result
      });
    });

    if (!imageId) {
      // Fallback: try to find the image by name if ID not found in stream
      const images = await docker.listImages({ filters: { reference: [`${imageName}:latest`] } });
      if (images.length > 0) {
        imageId = images[0].Id;
        console.log('Image ID found by listing images:', imageId);
      } else {
        throw new Error('Could not get image ID from build output or by listing images.');
      }
    }

    console.log('Docker image built successfully. Image ID:', imageId);

    // Generate a random port for the container
    const containerPort = 80; // Assuming web apps run on port 80
    const hostPort = Math.floor(Math.random() * (65535 - 49152) + 49152); // Random port in ephemeral range

    console.log(`Creating container from ${imageName}:latest on port ${hostPort}`);
    const container = await docker.createContainer({
      Image: `${imageName}:latest`,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: [], // Use default command from Dockerfile
      HostConfig: {
        PortBindings: {
          [`${containerPort}/tcp`]: [{ HostPort: `${hostPort}` }],
        },
      },
    });

    await container.start();
    console.log(`Container ${container.id} started.`);

    const appUrl = `http://localhost:${hostPort}`;
    console.log(`Container started. App URL: ${appUrl}`);

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, repository: gitUrl, framework, status: 'deployed', url: appUrl }])
      .select();

    if (error) {
      console.error('Error saving project to database:', error);
      // Even if saving fails, the build was successful, so we don't send a 500
    } else {
      console.log('Project saved to database:', data);
    }

    res.status(200).send(`Deployment for ${gitUrl} started. App URL: ${appUrl}`);
  } catch (error) {
    console.error('Deployment failed:', error);
    res.status(500).send('Deployment failed');
  } finally {
    // Clean up the temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${tempDir}`);
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});