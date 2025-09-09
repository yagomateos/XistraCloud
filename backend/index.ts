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

app.post('/deploy', async (req, res) => {
  const { gitUrl } = req.body;
  if (!gitUrl) {
    return res.status(400).send('Git URL is required');
  }

  console.log(`Deployment request for ${gitUrl}`);

  const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'repository';
  const tempDir = await fs.mkdtemp(path.join(__dirname, `${repoName}-`));

  try {
    console.log(`Cloning repository into ${tempDir}`);
    const git = simpleGit();
    await git.clone(gitUrl, tempDir);
    console.log('Repository cloned successfully');

    const imageName = repoName.toLowerCase();
    console.log(`Building Docker image: ${imageName}`);

    const stream = await docker.buildImage(
      {
        context: tempDir,
        src: ['Dockerfile'],
      },
      { t: imageName }
    );

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null, result: any) =>
        err ? reject(err) : resolve(result)
      );
    });

    console.log('Docker image built successfully');

    res.status(200).send(`Deployment for ${gitUrl} started.`);
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