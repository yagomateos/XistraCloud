-- XistraCloud Database Schema
-- PostgreSQL Database Schema for XistraCloud Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    subdomain VARCHAR(255),
    ports INTEGER[],
    urls TEXT[],
    environment JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Deployments table (for tracking deployment history)
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'building',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    urls TEXT[],
    ports INTEGER[],
    access_url TEXT,
    subdomain VARCHAR(255),
    subdomain_url TEXT,
    environment JSONB DEFAULT '{}',
    logs TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Database services table
CREATE TABLE IF NOT EXISTS database_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- mysql, postgresql, redis
    status VARCHAR(50) DEFAULT 'running',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ports INTEGER[],
    admin_port INTEGER,
    admin_url TEXT,
    environment JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Environment variables table
CREATE TABLE IF NOT EXISTS environment_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, key)
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Backups table
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- full, database, files
    status VARCHAR(50) DEFAULT 'pending',
    size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP,
    retention_days INTEGER DEFAULT 30,
    file_path TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- owner, admin, developer, viewer
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invited_by VARCHAR(255) NOT NULL,
    project_access UUID[] DEFAULT '{}',
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- info, warn, error, debug
    message TEXT NOT NULL,
    source VARCHAR(100),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_in BIGINT,
    network_out BIGINT,
    uptime BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_env_vars_project_id ON environment_variables(project_id);
CREATE INDEX IF NOT EXISTS idx_domains_project_id ON domains(project_id);
CREATE INDEX IF NOT EXISTS idx_backups_project_id ON backups(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_webhooks_project_id ON webhooks(project_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deployments_updated_at BEFORE UPDATE ON deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_database_services_updated_at BEFORE UPDATE ON database_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_environment_variables_updated_at BEFORE UPDATE ON environment_variables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backups_updated_at BEFORE UPDATE ON backups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data
INSERT INTO team_members (name, email, role, status) VALUES 
('Yago Mateos', 'yago@xistracloud.com', 'owner', 'active'),
('María García', 'maria@ejemplo.com', 'admin', 'active'),
('Carlos López', 'carlos@ejemplo.com', 'developer', 'active'),
('Ana Martín', 'ana@ejemplo.com', 'viewer', 'pending')
ON CONFLICT (email) DO NOTHING;

INSERT INTO team_invitations (email, role, invited_by, status) VALUES 
('nuevo@ejemplo.com', 'developer', 'Yago Mateos', 'pending'),
('colaborador@empresa.com', 'viewer', 'María García', 'pending')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (name, template_id, status, subdomain, ports, urls, environment) VALUES 
('WordPress Blog', 'wordpress-mysql', 'running', 'wordpress-blog-abc123', '{8080, 3306}', '{"http://localhost:8080"}', '{"MYSQL_ROOT_PASSWORD": "wordpress123"}'),
('React Portfolio', 'react-nginx', 'running', 'react-portfolio-def456', '{3000}', '{"http://localhost:3000"}', '{"NODE_ENV": "production"}'),
('MySQL Database', 'mysql-standalone', 'running', 'mysql-db-ghi789', '{3306, 8080}', '{"http://localhost:8080"}', '{"MYSQL_ROOT_PASSWORD": "mysql123"}')
ON CONFLICT DO NOTHING;

-- Insert sample deployments
INSERT INTO deployments (project_id, name, template, status, urls, ports, access_url, subdomain, subdomain_url) 
SELECT 
    p.id,
    p.name,
    p.template_id,
    p.status,
    p.urls,
    p.ports,
    p.urls[1],
    p.subdomain,
    CONCAT('https://', p.subdomain, '.xistracloud.com')
FROM projects p
ON CONFLICT DO NOTHING;

-- Insert sample backups
INSERT INTO backups (project_id, name, type, status, size, retention_days) 
SELECT 
    p.id,
    CONCAT('backup-', LOWER(p.name), '-', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
    'full',
    'completed',
    '245 MB',
    30
FROM projects p
WHERE p.name = 'WordPress Blog'
ON CONFLICT DO NOTHING;

-- Insert sample environment variables
INSERT INTO environment_variables (project_id, key, value, is_secret) 
SELECT 
    p.id,
    'NODE_ENV',
    'production',
    false
FROM projects p
WHERE p.template_id LIKE '%react%'
ON CONFLICT (project_id, key) DO NOTHING;

-- Insert sample system metrics
INSERT INTO system_metrics (cpu_usage, memory_usage, disk_usage, network_in, network_out, uptime) VALUES 
(25.5, 45.2, 60.8, 1024000, 512000, 86400),
(30.1, 48.7, 62.1, 1200000, 600000, 172800),
(22.8, 42.3, 59.5, 980000, 490000, 259200)
ON CONFLICT DO NOTHING;
