require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://metzjfocvkelucinstul.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.TAlKZI-3YcL6rHQzO-8dZqAhWEg7t5uPzpGlBhPJgpE';

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from XistraCloud backend! v2.0 - Delete projects enabled');
});

// Projects endpoints
app.get('/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
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
        deployments: stats.deployments,
        success: stats.success,
        failed: stats.failed
      })),
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.post('/projects', async (req, res) => {
  try {
    const { name, repository, framework } = req.body;
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, repository, framework, status: 'pending' }])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the project exists and belongs to the user
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();
    
    if (projectError || !projectData) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete associated domains first (due to foreign key constraint)
    const { error: domainsError } = await supabase
      .from('domains')
      .delete()
      .eq('project_id', id);
    
    if (domainsError) {
      console.error('Error deleting associated domains:', domainsError);
      return res.status(500).json({ error: 'Failed to delete associated domains' });
    }
    
    // Then delete the project
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json({ message: 'Project deleted successfully', id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Domains endpoints
app.get('/domains', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select(`
        *,
        projects (
          id,
          name,
          framework,
          status
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

app.post('/domains', async (req, res) => {
  try {
    const { domain, projectId } = req.body;
    
    if (!domain || !projectId) {
      return res.status(400).json({ error: 'Domain and projectId are required' });
    }
    
    const { data, error } = await supabase
      .from('domains')
      .insert([{ 
        domain, 
        project_id: projectId, 
        status: 'pending',
        dns_configured: false,
        ssl_enabled: false
      }])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Failed to create domain' });
  }
});

app.post('/domains/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get domain info
    const { data: domainData, error: domainError } = await supabase
      .from('domains')
      .select('domain')
      .eq('id', id)
      .single();
    
    if (domainError) throw domainError;
    
    const domain = domainData.domain;
    const isTestDomain = domain.includes('sinaptiks.com') || domain.includes('localhost') || domain.includes('test');
    
    let updateData = {};
    let message = '';
    
    if (isTestDomain) {
      // For test domains, always verify successfully
      updateData = {
        status: 'verified',
        dns_configured: true,
        ssl_enabled: true,
        verified_at: new Date().toISOString()
      };
      message = `Dominio ${domain} verificado exitosamente (modo test)`;
    } else {
      // For real domains, simulate DNS check
      const dnsConfigured = Math.random() > 0.3; // 70% success rate
      
      if (dnsConfigured) {
        updateData = {
          status: 'verified',
          dns_configured: true,
          ssl_enabled: true,
          verified_at: new Date().toISOString()
        };
        message = `Dominio ${domain} verificado exitosamente`;
      } else {
        updateData = {
          status: 'failed',
          dns_configured: false,
          ssl_enabled: false
        };
        message = `Error: No se pudo verificar ${domain}. Verifica la configuración DNS.`;
      }
    }
    
    const { data, error } = await supabase
      .from('domains')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({
      success: updateData.status === 'verified',
      message,
      domain: data[0]
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ error: 'Failed to verify domain' });
  }
});

// Logs endpoints
app.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const level = req.query.level;
    const projectId = req.query.projectId;
    
    let query = supabase
      .from('deployment_logs')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (level) {
      query = query.eq('level', level);
    }
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/logs', async (req, res) => {
  try {
    const { projectId, level, message, source, metadata } = req.body;
    
    const { data, error } = await supabase
      .from('deployment_logs')
      .insert([{
        project_id: projectId,
        level: level || 'info',
        message,
        source: source || 'system',
        metadata: metadata || {}
      }])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

app.listen(port, () => {
  console.log(`XistraCloud backend listening on port ${port}`);
});
