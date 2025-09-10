-- Create deployment_logs table for real-time logs
CREATE TABLE IF NOT EXISTS deployment_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success', 'debug')),
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'system', -- 'system', 'build', 'runtime', 'docker'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_project_id ON deployment_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_timestamp ON deployment_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_level ON deployment_logs(level);

-- Function to add log entry
CREATE OR REPLACE FUNCTION add_deployment_log(
    p_deployment_id UUID,
    p_project_id UUID,
    p_level VARCHAR,
    p_message TEXT,
    p_source VARCHAR DEFAULT 'system',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, metadata)
    VALUES (p_deployment_id, p_project_id, p_level, p_message, p_source, p_metadata)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Insert some realistic demo logs based on existing deployments
DO $$
DECLARE
    dep_rec RECORD;
    log_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- For each deployment, add realistic logs
    FOR dep_rec IN SELECT id, project_id, status, created_at FROM deployments LOOP
        log_time := dep_rec.created_at;
        
        -- Start deployment log
        INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
        VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Deployment started', 'system', log_time);
        
        log_time := log_time + INTERVAL '10 seconds';
        
        -- Git clone log
        INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
        VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Cloning repository from Git...', 'build', log_time);
        
        log_time := log_time + INTERVAL '15 seconds';
        
        -- Install dependencies
        INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
        VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Installing dependencies with npm...', 'build', log_time);
        
        log_time := log_time + INTERVAL '45 seconds';
        
        -- Build process
        INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
        VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Building application...', 'build', log_time);
        
        log_time := log_time + INTERVAL '30 seconds';
        
        -- Docker build
        INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
        VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Building Docker container...', 'docker', log_time);
        
        log_time := log_time + INTERVAL '60 seconds';
        
        -- Status-based logs
        IF dep_rec.status = 'success' THEN
            INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
            VALUES (dep_rec.id, dep_rec.project_id, 'success', 'Deployment completed successfully', 'system', log_time);
            
            log_time := log_time + INTERVAL '5 seconds';
            INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
            VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Application is now live at https://app.xistracloud.com', 'system', log_time);
            
        ELSIF dep_rec.status = 'failed' THEN
            INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
            VALUES (dep_rec.id, dep_rec.project_id, 'error', 'Build failed: Module not found error', 'build', log_time);
            
            log_time := log_time + INTERVAL '2 seconds';
            INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
            VALUES (dep_rec.id, dep_rec.project_id, 'error', 'Deployment failed', 'system', log_time);
            
        ELSE -- building/pending
            INSERT INTO deployment_logs (deployment_id, project_id, level, message, source, timestamp)
            VALUES (dep_rec.id, dep_rec.project_id, 'info', 'Deployment in progress...', 'system', log_time);
        END IF;
        
    END LOOP;
END $$;

-- RLS Policy for deployment_logs
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their projects" ON deployment_logs
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            user_id = auth.uid() OR 
            organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid()
            )
        )
    );
