const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  user: 'xistracloud',
  host: 'localhost',
  database: 'xistracloud',
  password: 'xistracloud2025',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('🗄️ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Database helper functions
class Database {
  // Generic query function
  static async query(text, params = []) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`🗄️ Query executed in ${duration}ms:`, text.substring(0, 100));
      return res;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  // Projects
  static async getProjects() {
    const result = await this.query(`
      SELECT p.*, 
             COUNT(d.id) as deployment_count,
             COUNT(ev.id) as env_var_count
      FROM projects p
      LEFT JOIN deployments d ON p.id = d.project_id
      LEFT JOIN environment_variables ev ON p.id = ev.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  static async getProjectById(id) {
    const result = await this.query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createProject(projectData) {
    const { name, template_id, status = 'pending', user_id, subdomain, ports, urls, environment = {} } = projectData;
    const result = await this.query(`
      INSERT INTO projects (name, template_id, status, user_id, subdomain, ports, urls, environment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, template_id, status, user_id, subdomain, ports, urls, JSON.stringify(environment)]);
    return result.rows[0];
  }

  static async updateProject(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(`
      UPDATE projects 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, ...values]);
    return result.rows[0];
  }

  static async deleteProject(id) {
    const result = await this.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Deployments
  static async getDeployments() {
    const result = await this.query(`
      SELECT d.*, p.name as project_name, p.template_id
      FROM deployments d
      LEFT JOIN projects p ON d.project_id = p.id
      ORDER BY d.created_at DESC
    `);
    return result.rows;
  }

  static async createDeployment(deploymentData) {
    const { project_id, name, template, status = 'building', urls, ports, access_url, subdomain, subdomain_url, environment = {} } = deploymentData;
    const result = await this.query(`
      INSERT INTO deployments (project_id, name, template, status, urls, ports, access_url, subdomain, subdomain_url, environment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [project_id, name, template, status, urls, ports, access_url, subdomain, subdomain_url, JSON.stringify(environment)]);
    return result.rows[0];
  }

  static async updateDeployment(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(`
      UPDATE deployments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, ...values]);
    return result.rows[0];
  }

  static async deleteDeployment(id) {
    const result = await this.query('DELETE FROM deployments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Database Services
  static async getDatabaseServices() {
    const result = await this.query('SELECT * FROM database_services ORDER BY created_at DESC');
    return result.rows;
  }

  static async createDatabaseService(serviceData) {
    const { name, type, status = 'running', ports, admin_port, admin_url, environment = {} } = serviceData;
    const result = await this.query(`
      INSERT INTO database_services (name, type, status, ports, admin_port, admin_url, environment)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, type, status, ports, admin_port, admin_url, JSON.stringify(environment)]);
    return result.rows[0];
  }

  static async deleteDatabaseService(id) {
    const result = await this.query('DELETE FROM database_services WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Environment Variables
  static async getEnvironmentVariables(projectId) {
    const result = await this.query('SELECT * FROM environment_variables WHERE project_id = $1 ORDER BY key', [projectId]);
    return result.rows;
  }

  static async createEnvironmentVariable(projectId, key, value, isSecret = false) {
    const result = await this.query(`
      INSERT INTO environment_variables (project_id, key, value, is_secret)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [projectId, key, value, isSecret]);
    return result.rows[0];
  }

  static async updateEnvironmentVariable(id, key, value, isSecret = false) {
    const result = await this.query(`
      UPDATE environment_variables 
      SET key = $2, value = $3, is_secret = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, key, value, isSecret]);
    return result.rows[0];
  }

  static async deleteEnvironmentVariable(id) {
    const result = await this.query('DELETE FROM environment_variables WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Backups
  static async getBackups() {
    const result = await this.query(`
      SELECT b.*, p.name as project_name
      FROM backups b
      LEFT JOIN projects p ON b.project_id = p.id
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }

  static async createBackup(backupData) {
    const { name, project_id, type, status = 'pending', size, scheduled_at, retention_days = 30 } = backupData;
    const result = await this.query(`
      INSERT INTO backups (name, project_id, type, status, size, scheduled_at, retention_days)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, project_id, type, status, size, scheduled_at, retention_days]);
    return result.rows[0];
  }

  static async deleteBackup(id) {
    const result = await this.query('DELETE FROM backups WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Team Members
  static async getTeamMembers() {
    const result = await this.query('SELECT * FROM team_members ORDER BY joined_at DESC');
    return result.rows;
  }

  static async createTeamMember(memberData) {
    const { name, email, role, status = 'active', avatar_url } = memberData;
    const result = await this.query(`
      INSERT INTO team_members (name, email, role, status, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, email, role, status, avatar_url]);
    return result.rows[0];
  }

  static async deleteTeamMember(id) {
    const result = await this.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Team Invitations
  static async getTeamInvitations() {
    const result = await this.query('SELECT * FROM team_invitations ORDER BY invited_at DESC');
    return result.rows;
  }

  static async createTeamInvitation(invitationData) {
    const { email, role, invited_by, project_access = [], token, expires_at } = invitationData;
    const result = await this.query(`
      INSERT INTO team_invitations (email, role, invited_by, project_access, token, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [email, role, invited_by, project_access, token, expires_at]);
    return result.rows[0];
  }

  static async deleteTeamInvitation(id) {
    const result = await this.query('DELETE FROM team_invitations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // System Metrics
  static async getSystemMetrics() {
    const result = await this.query(`
      SELECT * FROM system_metrics 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    return result.rows;
  }

  static async createSystemMetric(metricData) {
    const { cpu_usage, memory_usage, disk_usage, network_in, network_out, uptime } = metricData;
    const result = await this.query(`
      INSERT INTO system_metrics (cpu_usage, memory_usage, disk_usage, network_in, network_out, uptime)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [cpu_usage, memory_usage, disk_usage, network_in, network_out, uptime]);
    return result.rows[0];
  }

  // System Logs
  static async getSystemLogs(limit = 50) {
    const result = await this.query(`
      SELECT sl.*, p.name as project_name
      FROM system_logs sl
      LEFT JOIN projects p ON sl.project_id = p.id
      ORDER BY sl.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  static async createSystemLog(logData) {
    const { level, message, source, project_id, metadata = {} } = logData;
    const result = await this.query(`
      INSERT INTO system_logs (level, message, source, project_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [level, message, source, project_id, JSON.stringify(metadata)]);
    return result.rows[0];
  }

  // Close connection pool
  static async close() {
    await pool.end();
  }
}

module.exports = Database;
