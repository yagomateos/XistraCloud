-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    repository VARCHAR(255) NOT NULL,
    framework VARCHAR(50),
    status VARCHAR(50) DEFAULT 'created',
    last_deploy TIMESTAMP WITH TIME ZONE,
    url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID,
    build_command VARCHAR(255),
    install_command VARCHAR(255),
    output_directory VARCHAR(255)
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    branch VARCHAR(255),
    commit_hash VARCHAR(100),
    commit_message TEXT,
    logs TEXT,
    url VARCHAR(255),
    duration INTEGER -- en segundos
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'deployment', 'domain', 'error', etc.
    project_id UUID REFERENCES projects(id),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- Para almacenar datos adicionales específicos del tipo de actividad
);

-- Triggers para mantener updated_at actualizado
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Función para registrar actividad
CREATE OR REPLACE FUNCTION log_activity(
    p_type VARCHAR,
    p_project_id UUID,
    p_message TEXT,
    p_status VARCHAR,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (type, project_id, message, status, metadata)
    VALUES (p_type, p_project_id, p_message, p_status, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

INSERT INTO projects (name, repository, framework, status) VALUES 
('landing-page', 'https://github.com/user/landing', 'react', 'deployed'),
('api-service', 'https://github.com/user/api', 'nodejs', 'deployed'),
('dashboard', 'https://github.com/user/dashboard', 'vue', 'building');
