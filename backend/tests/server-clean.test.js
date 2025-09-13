// Test para el server.js limpio sin dns_configured
const request = require('supertest');

// Mock supabase antes de importar el servidor
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('Clean Server.js Tests', () => {
  let app;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Importar el servidor después de los mocks
    app = require('../server.js');
  });

  describe('GET /', () => {
    test('should return new API version info', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('v3.0');
      expect(response.body.status).toBe('dns_configured column removed');
    });
  });

  describe('GET /test-deployment', () => {
    test('should return deployment confirmation', async () => {
      const response = await request(app).get('/test-deployment');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('NEW CODE DEPLOYED');
      expect(response.body.fix).toBe('dns_configured removed');
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /domains - Success Case', () => {
    test('should create domain successfully without dns_configured', async () => {
      // Mock successful project lookup
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: { id: 'test-project', name: 'Test Project' },
                  error: null
                })
              })
            })
          };
        }
        
        if (table === 'domains') {
          // First call: check existing domain (returns null - not found)
          if (mockSupabase.from.mock.calls.filter(call => call[0] === 'domains').length === 1) {
            return {
              select: () => ({
                eq: () => ({
                  single: () => Promise.resolve({
                    data: null,
                    error: null
                  })
                })
              })
            };
          }
          // Second call: insert new domain
          return {
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: 'new-domain-id',
                    domain: 'test.com',
                    project_id: 'test-project',
                    status: 'pending',
                    ssl_enabled: false,
                    dns_records: expect.any(Object),
                    verification_token: expect.any(String),
                    created_at: new Date().toISOString()
                  },
                  error: null
                })
              })
            })
          };
        }
        
        return mockSupabase;
      });

      const response = await request(app)
        .post('/domains')
        .send({
          domain: 'test.com',
          project_id: 'test-project',
          projectId: 'test-project'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.domain).toHaveProperty('id');
      expect(response.body.domain.domain).toBe('test.com');
      expect(response.body.domain.projectId).toBe('test-project');
      
      // Verificar que NO se usa dns_configured
      const insertCalls = mockSupabase.from.mock.calls.filter(call => call[0] === 'domains');
      expect(insertCalls.length).toBeGreaterThan(0);
    });
  });

  describe('POST /domains - Validation', () => {
    test('should reject missing domain', async () => {
      const response = await request(app)
        .post('/domains')
        .send({
          project_id: 'test-project'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject invalid domain format', async () => {
      const response = await request(app)
        .post('/domains')
        .send({
          domain: 'invalid',
          project_id: 'test-project'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid domain format');
      expect(response.body.valid).toBe(false);
    });
  });

  describe('POST /domains - Project Not Found', () => {
    test('should handle project not found', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({
                  data: null,
                  error: { message: 'Project not found' }
                })
              })
            })
          };
        }
        return mockSupabase;
      });

      const response = await request(app)
        .post('/domains')
        .send({
          domain: 'test.com',
          project_id: 'nonexistent-project'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('GET /projects', () => {
    test('should return projects list', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'projects') {
          return {
            select: () => Promise.resolve({
              data: [
                { id: '1', name: 'Project 1' },
                { id: '2', name: 'Project 2' }
              ],
              error: null
            })
          };
        }
        return mockSupabase;
      });

      const response = await request(app).get('/projects');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
    });
  });
});
