-- Create deployment_logs table for real-time logging (simplified version)
CREATE TABLE IF NOT EXISTS deployment_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    deployment_id UUID, -- Reference to deployments if exists
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error', 'success')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    source VARCHAR(50) DEFAULT 'system'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployment_logs_project_id ON deployment_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_level ON deployment_logs(level);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_source ON deployment_logs(source);

-- RLS policies for deployment_logs (simplified without organizations)
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all logs" ON deployment_logs
    FOR SELECT USING (true);

CREATE POLICY "System can insert logs" ON deployment_logs
    FOR INSERT WITH CHECK (true);

-- Insert sample logs for demo
DO $$
DECLARE
    sample_project_id UUID;
BEGIN
    -- Get a project ID for demo logs
    SELECT id INTO sample_project_id FROM projects LIMIT 1;
    
    IF sample_project_id IS NOT NULL THEN
        -- Insert realistic deployment logs
        INSERT INTO deployment_logs (project_id, level, message, timestamp, source, metadata) VALUES
            (sample_project_id, 'info', 'Iniciando despliegue del proyecto...', NOW() - INTERVAL '2 hours', 'deployment', '{"step": "start", "commit": "abc123"}'),
            (sample_project_id, 'info', 'Descargando código fuente desde repositorio', NOW() - INTERVAL '2 hours' + INTERVAL '5 seconds', 'git', '{"repository": "https://github.com/user/project"}'),
            (sample_project_id, 'info', 'Detectado framework: Next.js', NOW() - INTERVAL '2 hours' + INTERVAL '10 seconds', 'detector', '{"framework": "nextjs", "version": "14.0.0"}'),
            (sample_project_id, 'info', 'Instalando dependencias...', NOW() - INTERVAL '2 hours' + INTERVAL '15 seconds', 'npm', '{"command": "npm install"}'),
            (sample_project_id, 'info', 'Dependencias instaladas correctamente', NOW() - INTERVAL '2 hours' + INTERVAL '45 seconds', 'npm', '{"packages": 127}'),
            (sample_project_id, 'info', 'Construyendo aplicación...', NOW() - INTERVAL '2 hours' + INTERVAL '50 seconds', 'build', '{"command": "npm run build"}'),
            (sample_project_id, 'warn', 'Advertencia: Imagen grande detectada (1.2MB)', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute', 'build', '{"file": "public/hero-image.jpg", "size": "1.2MB"}'),
            (sample_project_id, 'info', 'Build completado exitosamente', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes', 'build', '{"duration": "120s", "size": "45MB"}'),
            (sample_project_id, 'info', 'Creando imagen Docker...', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes 10 seconds', 'docker', '{"dockerfile": "Dockerfile"}'),
            (sample_project_id, 'info', 'Imagen Docker creada: xistracloud/project:latest', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes', 'docker', '{"image": "xistracloud/project:latest", "size": "267MB"}'),
            (sample_project_id, 'info', 'Iniciando contenedor...', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes 10 seconds', 'container', '{"port": 3000}'),
            (sample_project_id, 'success', 'Despliegue completado exitosamente', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes 30 seconds', 'deployment', '{"url": "https://my-app.xistracloud.app", "duration": "3m30s"}'),
            
            -- Recent logs (last hour)
            (sample_project_id, 'info', 'Health check ejecutado', NOW() - INTERVAL '30 minutes', 'monitor', '{"status": "healthy", "response_time": "45ms"}'),
            (sample_project_id, 'info', 'Tráfico HTTP: 127 requests', NOW() - INTERVAL '25 minutes', 'analytics', '{"requests": 127, "unique_visitors": 23}'),
            (sample_project_id, 'warn', 'Uso de CPU elevado: 78%', NOW() - INTERVAL '20 minutes', 'monitor', '{"cpu": "78%", "memory": "45%"}'),
            (sample_project_id, 'info', 'Auto-escalado activado: +1 instancia', NOW() - INTERVAL '19 minutes', 'autoscaler', '{"instances": 2, "reason": "high_cpu"}'),
            (sample_project_id, 'info', 'CPU normalizado: 34%', NOW() - INTERVAL '15 minutes', 'monitor', '{"cpu": "34%", "memory": "42%"}'),
            (sample_project_id, 'info', 'Backup automático completado', NOW() - INTERVAL '10 minutes', 'backup', '{"size": "145MB", "location": "s3://backups/"}'),
            (sample_project_id, 'info', 'SSL certificado renovado', NOW() - INTERVAL '5 minutes', 'ssl', '{"domain": "my-app.xistracloud.app", "expires": "2026-01-15"}'),
            (sample_project_id, 'info', 'Health check ejecutado', NOW() - INTERVAL '2 minutes', 'monitor', '{"status": "healthy", "response_time": "32ms"}'),
            (sample_project_id, 'info', 'Sistema funcionando correctamente', NOW() - INTERVAL '30 seconds', 'system', '{"uptime": "99.9%"}');
    END IF;
END $$;
