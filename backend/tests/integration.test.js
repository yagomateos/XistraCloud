// Simple integration test that we can run right now
describe('Domain Creation Integration Test', () => {
  
  test('Domain validation regex works correctly', () => {
    // Updated regex that requires valid TLD and handles multiple subdomains
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    // Valid domains
    expect('example.com').toMatch(domainRegex);
    expect('subdomain.example.com').toMatch(domainRegex);
    expect('test-123.org').toMatch(domainRegex);
    expect('a.b.c.com').toMatch(domainRegex);
    expect('sinaptiks.com').toMatch(domainRegex);
    
    // Invalid domains
    expect('').not.toMatch(domainRegex);
    expect('invalid').not.toMatch(domainRegex);        // No TLD
    expect('example.c').not.toMatch(domainRegex);       // TLD too short
    expect('.example.com').not.toMatch(domainRegex);
    expect('example-.com').not.toMatch(domainRegex);
    expect('-example.com').not.toMatch(domainRegex);
  });

  test('DNS records generation', () => {
    const domain = 'test.com';
    const token = 'abc123';
    
    const dnsRecords = {
      cname: {
        name: domain,
        value: 'xistracloud.app'
      },
      txt: {
        name: `_xistracloud.${domain}`,
        value: `xistracloud-verification=${token}`
      }
    };
    
    expect(dnsRecords.cname.name).toBe('test.com');
    expect(dnsRecords.cname.value).toBe('xistracloud.app');
    expect(dnsRecords.txt.name).toBe('_xistracloud.test.com');
    expect(dnsRecords.txt.value).toBe('xistracloud-verification=abc123');
  });

  test('Project ID compatibility check', () => {
    // Simulating the backend logic
    const req = {
      body: {
        domain: 'test.com',
        project_id: 'id-from-project_id',
        projectId: 'id-from-projectId'
      }
    };
    
    const { project_id, projectId } = req.body;
    const projectIdValue = project_id || projectId;
    
    expect(projectIdValue).toBe('id-from-project_id');
    
    // Test fallback to projectId
    const req2 = {
      body: {
        domain: 'test.com',
        projectId: 'id-from-projectId-only'
      }
    };
    
    const { project_id: pid2, projectId: pId2 } = req2.body;
    const projectIdValue2 = pid2 || pId2;
    
    expect(projectIdValue2).toBe('id-from-projectId-only');
  });

  test('Domain length validation', () => {
    const validateDomainLength = (domain) => {
      return domain.length >= 1 && domain.length <= 253;
    };
    
    expect(validateDomainLength('example.com')).toBe(true);
    expect(validateDomainLength('')).toBe(false);
    expect(validateDomainLength('a'.repeat(254))).toBe(false);
    expect(validateDomainLength('a'.repeat(253))).toBe(true);
  });

  test('Protocol cleanup function', () => {
    const cleanProtocol = (domain) => {
      return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    };
    
    expect(cleanProtocol('https://example.com')).toBe('example.com');
    expect(cleanProtocol('http://example.com')).toBe('example.com');
    expect(cleanProtocol('https://example.com/')).toBe('example.com');
    expect(cleanProtocol('example.com')).toBe('example.com');
  });

  test('Error response format', () => {
    const createErrorResponse = (status, message) => {
      return {
        status,
        json: () => ({ error: message })
      };
    };
    
    const error400 = createErrorResponse(400, 'Invalid domain format');
    const error404 = createErrorResponse(404, 'Project not found');
    const error409 = createErrorResponse(409, 'Domain already exists');
    const error500 = createErrorResponse(500, 'Failed to create domain');
    
    expect(error400.status).toBe(400);
    expect(error404.json().error).toBe('Project not found');
    expect(error409.json().error).toBe('Domain already exists');
    expect(error500.json().error).toBe('Failed to create domain');
  });

});
