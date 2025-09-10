import { supabase } from '../lib/supabase';
import fs from 'fs/promises';
import path from 'path';

async function runMigration() {
  try {
    console.log('Iniciando migración...');
    
    // Leer el archivo SQL
    const sqlContent = await fs.readFile(
      path.join(__dirname, 'init.sql'),
      'utf-8'
    );

    // Ejecutar la migración
    // Dividimos el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    // Ejecutamos cada comando por separado
    for (const command of commands) {
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      if (error) {
        throw error;
      }
    }

    console.log('Migración completada exitosamente');

    // Insertar algunos datos de ejemplo
    await insertSampleData();
    
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  console.log('Insertando datos de ejemplo...');

  // Crear un proyecto de ejemplo
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: 'ejemplo-app',
      repository: 'https://github.com/usuario/ejemplo-app',
      framework: 'React',
      status: 'deployed',
      build_command: 'npm run build',
      install_command: 'npm install',
      output_directory: 'dist'
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Crear algunos despliegues
  await supabase
    .from('deployments')
    .insert([
      {
        project_id: project.id,
        status: 'success',
        branch: 'main',
        commit_hash: 'abc123',
        commit_message: 'Initial commit',
        duration: 120
      },
      {
        project_id: project.id,
        status: 'failed',
        branch: 'main',
        commit_hash: 'def456',
        commit_message: 'Update dependencies',
        duration: 45
      }
    ]);

  // Registrar algunas actividades
  await supabase.rpc('log_activity', {
    p_type: 'deployment',
    p_project_id: project.id,
    p_message: 'Despliegue inicial completado',
    p_status: 'success'
  });

  console.log('Datos de ejemplo insertados correctamente');
}

runMigration();
