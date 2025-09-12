const request = require('supertest');
const app = require('../index.ts'); // Tendremos que ajustar esto

describe('XistraCloud API Tests', () => {
  
  describe('Health Check', () => {
    test('GET / should return API info', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Projects API', () => {
    test('GET /projects should return projects list', async () => {
      const response = await request(app).get('/projects');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /projects should create project with valid data', async () => {
      const projectData = {
        name: 'test-project',
        repository: 'https://github.com/test/repo',
        framework: 'React'
      };
      
      const response = await request(app)
        .post('/projects')
        .send(projectData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
    });

    test('POST /projects should fail with invalid data', async () => {
      const invalidData = {
        name: '', // Empty name should fail
        repository: 'invalid-url'
      };
      
      const response = await request(app)
        .post('/projects')
        .send(invalidData);
      
      expect(response.status).toBe(400);
    });
  });

  describe('Domains API', () => {
    let testProjectId;
    
    beforeEach(async () => {
      // Create a test project for domain tests
      const projectResponse = await request(app)
        .post('/projects')
        .send({
          name: 'test-project-for-domain',
          repository: 'https://github.com/test/repo',
          framework: 'React'
        });
      testProjectId = projectResponse.body.id;
    });

    test('GET /domains should return domains list', async () => {
      const response = await request(app).get('/domains');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /domains should create domain with valid data', async () => {
      const domainData = {
        domain: 'test-example.com',
        project_id: testProjectId
      };
      
      const response = await request(app)
        .post('/domains')
        .send(domainData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.domain).toBe(domainData.domain);
      expect(response.body).toHaveProperty('dnsRecords');
    });

    test('POST /domains should accept projectId field for compatibility', async () => {
      const domainData = {
        domain: 'test-compatibility.com',
        projectId: testProjectId // Using projectId instead of project_id
      };
      
      const response = await request(app)
        .post('/domains')
        .send(domainData);
      
      expect(response.status).toBe(201);
      expect(response.body.domain).toBe(domainData.domain);
    });

    test('POST /domains should fail with invalid domain format', async () => {
      const invalidDomains = [
        { domain: '', project_id: testProjectId },
        { domain: 'invalid', project_id: testProjectId },
        { domain: '.invalid.com', project_id: testProjectId },
        { domain: 'invalid-.com', project_id: testProjectId }
      ];
      
      for (const invalidData of invalidDomains) {
        const response = await request(app)
          .post('/domains')
          .send(invalidData);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid domain format');
      }
    });

    test('POST /domains should fail with non-existent project', async () => {
      const domainData = {
        domain: 'test.com',
        project_id: 'non-existent-id'
      };
      
      const response = await request(app)
        .post('/domains')
        .send(domainData);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });

    test('POST /domains should fail with duplicate domain', async () => {
      const domainData = {
        domain: 'duplicate-test.com',
        project_id: testProjectId
      };
      
      // Create first domain
      await request(app).post('/domains').send(domainData);
      
      // Try to create duplicate
      const response = await request(app)
        .post('/domains')
        .send(domainData);
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Domain already exists');
    });
  });

  describe('Database Connection', () => {
    test('Supabase connection should be working', async () => {
      // This will implicitly test DB connection through any API call
      const response = await request(app).get('/projects');
      expect(response.status).not.toBe(500);
    });
  });
});
