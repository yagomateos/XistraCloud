-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain VARCHAR(255) NOT NULL UNIQUE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
    ssl_enabled BOOLEAN DEFAULT false,
    dns_records JSONB DEFAULT '{}',
    verification_token VARCHAR(100),
    last_checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_project_id ON domains(project_id);
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at
    BEFORE UPDATE ON domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS VARCHAR AS $$
BEGIN
    RETURN SUBSTR(MD5(RANDOM()::TEXT), 1, 20);
END;
$$ LANGUAGE plpgsql;

-- Function to add domain with verification token
CREATE OR REPLACE FUNCTION add_domain(
    p_domain VARCHAR,
    p_project_id UUID,
    p_user_id UUID,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE(
    domain_id UUID,
    verification_token VARCHAR,
    dns_instructions JSONB
) AS $$
DECLARE
    new_domain_id UUID;
    token VARCHAR;
    dns_config JSONB;
BEGIN
    -- Generate verification token
    token := generate_verification_token();
    
    -- Insert domain
    INSERT INTO domains (domain, project_id, user_id, organization_id, verification_token)
    VALUES (p_domain, p_project_id, p_user_id, p_organization_id, token)
    RETURNING id INTO new_domain_id;
    
    -- Create DNS configuration instructions
    dns_config := jsonb_build_object(
        'cname', jsonb_build_object(
            'name', p_domain,
            'value', 'xistracloud.app'
        ),
        'txt', jsonb_build_object(
            'name', '_xistracloud.' || p_domain,
            'value', 'xistracloud-verification=' || token
        )
    );
    
    -- Update domain with DNS records
    UPDATE domains 
    SET dns_records = dns_config 
    WHERE id = new_domain_id;
    
    RETURN QUERY SELECT new_domain_id, token, dns_config;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for domains
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their domains" ON domains
    FOR SELECT USING (
        user_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their domains" ON domains
    FOR ALL USING (
        user_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Insert some demo domains
DO $$
DECLARE
    demo_project_id UUID;
    demo_user_id UUID;
BEGIN
    -- Get a project ID for demo
    SELECT id INTO demo_project_id FROM projects LIMIT 1;
    
    IF demo_project_id IS NOT NULL THEN
        INSERT INTO domains (domain, project_id, status, ssl_enabled, verification_token) VALUES
            ('mi-app-web.com', demo_project_id, 'verified', true, 'demo_token_123'),
            ('staging.mi-app-web.com', demo_project_id, 'pending', false, 'demo_token_456'),
            ('api.mi-empresa.com', demo_project_id, 'failed', false, 'demo_token_789')
        ON CONFLICT (domain) DO NOTHING;
    END IF;
END $$;
