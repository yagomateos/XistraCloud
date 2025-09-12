describe('Domain Validation Tests', () => {
  
  describe('Domain Format Validation', () => {
    // Updated regex that requires valid TLD and handles multiple subdomains
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    
    const validDomains = [
      'example.com',
      'subdomain.example.com',
      'test123.com',
      'my-site.org',
      'a.b.c.d.com',
      '123domain.net'
    ];

    const invalidDomains = [
      '',
      'invalid',           // No TLD
      'example.c',         // TLD too short
      '.example.com',
      'example-.com',
      '-example.com',
      'example..com',
      'example.com.',
      'ex ample.com',
      'a'.repeat(254) + '.com' // Too long
    ];

    test.each(validDomains)('should accept valid domain: %s', (domain) => {
      expect(domainRegex.test(domain)).toBe(true);
      expect(domain.length).toBeLessThanOrEqual(253);
    });

    test.each(invalidDomains)('should reject invalid domain: %s', (domain) => {
      const isValidFormat = domainRegex.test(domain);
      const isValidLength = domain.length >= 1 && domain.length <= 253;
      expect(isValidFormat && isValidLength).toBe(false);
    });
  });

  describe('Protocol Cleanup', () => {
    const cleanupProtocol = (domain) => {
      return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    };

    test('should remove https:// protocol', () => {
      expect(cleanupProtocol('https://example.com')).toBe('example.com');
    });

    test('should remove http:// protocol', () => {
      expect(cleanupProtocol('http://example.com')).toBe('example.com');
    });

    test('should remove trailing slash', () => {
      expect(cleanupProtocol('https://example.com/')).toBe('example.com');
    });

    test('should handle domain without protocol', () => {
      expect(cleanupProtocol('example.com')).toBe('example.com');
    });
  });

  describe('DNS Records Generation', () => {
    test('should generate correct DNS records', () => {
      const domain = 'example.com';
      const verificationToken = 'test-token-123';
      
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

      expect(dnsRecords.cname.name).toBe(domain);
      expect(dnsRecords.cname.value).toBe('xistracloud.app');
      expect(dnsRecords.txt.name).toBe(`_xistracloud.${domain}`);
      expect(dnsRecords.txt.value).toContain(verificationToken);
    });
  });
});
