// Simple working endpoint that bypasses all Railway issues
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'XistraCloud API v3.0 - FIXED DNS CONFIGURED ISSUE',
    timestamp: new Date().toISOString(),
    version: '2025-09-13-FINAL-FIX',
    status: 'dns_configured column removed'
  });
});

// Test endpoint to verify deployment
app.get('/test-deployment', (req, res) => {
  res.json({
    status: 'NEW CODE DEPLOYED',
    timestamp: new Date().toISOString(),
    fix: 'dns_configured removed',
    success: true
  });
});

// Get all domains
app.get('/domains', async (req, res) => {
  try {
    console.log('🌐 Fetching all domains');
    
    const { data: domains, error } = await supabase
      .from('domains')
      .select(`
        id,
        domain,
        project_id,
        created_at,
        status,
        ssl_enabled,
        dns_records,
        verification_token,
        projects!inner (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error fetching domains:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch domains',
        supabaseError: error.message 
      });
    }

    console.log(`✅ Found ${domains?.length || 0} domains`);
    res.json({ domains: domains || [] });

  } catch (error) {
    console.error('❌ Error fetching domains:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Dashboard stats endpoint
app.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats');
    
    // Get counts
    const { count: domainsCount } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true });

    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    res.json({
      totalDomains: domainsCount || 0,
      totalProjects: projectsCount || 0,
      totalDeployments: 156, // Mock for now
      uptime: 99.9
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error.message 
    });
  }
});

// Logs endpoint
app.get('/logs', async (req, res) => {
  try {
    console.log('📝 Fetching logs');
    
    // Mock logs for now - you can integrate with actual logging later
    res.json([
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Domain created successfully',
        source: 'api'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'info',
        message: 'Project deployment completed',
        source: 'deployment'
      }
    ]);

  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch logs',
      details: error.message 
    });
  }
});

// Working domain creation endpoint
app.post('/domains', async (req, res) => {
  try {
    console.log('🚀 Domain creation v2.0:', req.body);
    
    const { domain, project_id, projectId } = req.body;
    const projectIdValue = project_id || projectId;

    // Basic validation
    if (!domain || !projectIdValue) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { domain: !!domain, project_id: !!project_id, projectId: !!projectId }
      });
    }

    // Domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ 
        error: 'Invalid domain format',
        domain,
        valid: false
      });
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectIdValue)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ 
        error: 'Project not found',
        projectId: projectIdValue,
        supabaseError: projectError?.message
      });
    }

    // Check existing domain
    const { data: existing } = await supabase
      .from('domains')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existing) {
      return res.status(409).json({ 
        error: 'Domain already exists',
        domain,
        existingId: existing.id
      });
    }

    // Create domain
    const verificationToken = Math.random().toString(36).substring(2, 22);
    const dnsRecords = {
      cname: { name: domain, value: 'xistracloud.app' },
      txt: { name: `_xistracloud.${domain}`, value: `xistracloud-verification=${verificationToken}` }
    };

    console.log('🚀 Creating domain in database:', {
      domain,
      project_id: projectIdValue,
      status: 'pending',
      ssl_enabled: false,
      dns_records: dnsRecords,
      verification_token: verificationToken
    });

    const { data: newDomain, error: insertError } = await supabase
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

    if (insertError) {
      return res.status(500).json({
        error: 'Database insertion failed',
        details: insertError.message,
        code: insertError.code
      });
    }

    // Success response
    res.status(201).json({
      success: true,
      domain: {
        id: newDomain.id,
        domain: newDomain.domain,
        projectName: project.name,
        projectId: project.id,
        status: newDomain.status,
        ssl: newDomain.ssl_enabled,
        dnsRecords: newDomain.dns_records,
        verificationToken: newDomain.verification_token,
        createdAt: newDomain.created_at
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
});

// Delete domain endpoint
app.delete('/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting domain with ID:', id);

    if (!id) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    // Check if domain exists
    const { data: domain, error: checkError } = await supabase
      .from('domains')
      .select('id, domain')
      .eq('id', id)
      .single();

    if (checkError || !domain) {
      return res.status(404).json({ 
        error: 'Domain not found',
        domainId: id 
      });
    }

    // Delete domain
    const { error: deleteError } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Supabase error deleting domain:', deleteError);
      return res.status(500).json({ 
        error: 'Failed to delete domain',
        supabaseError: deleteError.message 
      });
    }

    console.log('✅ Domain deleted successfully:', domain.domain);
    res.json({
      success: true,
      message: 'Domain deleted successfully',
      deletedDomain: domain
    });

  } catch (error) {
    console.error('❌ Error deleting domain:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get projects endpoint
app.get('/projects', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Temporary endpoint to fix mock domain statuses
app.post('/fix-domains', async (req, res) => {
  try {
    console.log('🔧 Fixing mock domain statuses');
    
    // Update different domains with realistic statuses
    const updates = [
      { domain: 'test.com', status: 'verified', ssl_enabled: true },
      { domain: 'mi-nuevo-dominio.com', status: 'pending', ssl_enabled: false },
      { domain: 'mi-app-web.com', status: 'verified', ssl_enabled: true },
      { domain: 'staging.mi-app-web.com', status: 'pending', ssl_enabled: false },
      { domain: 'api.mi-empresa.com', status: 'failed', ssl_enabled: false },
      { domain: 'sinaptiks.com', status: 'verified', ssl_enabled: true }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('domains')
        .update({ 
          status: update.status, 
          ssl_enabled: update.ssl_enabled 
        })
        .eq('domain', update.domain);
      
      if (error) {
        console.error(`❌ Error updating ${update.domain}:`, error);
      } else {
        console.log(`✅ Updated ${update.domain} to ${update.status}`);
      }
    }

    res.json({
      success: true,
      message: 'Domain statuses updated with realistic mix',
      updated: updates.length
    });

  } catch (error) {
    console.error('❌ Error fixing domains:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`✅ XistraCloud API v2.0 running on port ${port}`);
  console.log(`🔗 Access: http://localhost:${port}`);
});

module.exports = app;
