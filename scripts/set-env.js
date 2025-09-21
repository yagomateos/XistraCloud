#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Detectar entorno
const environment = process.argv[2] || process.env.NODE_ENV || 'development';

console.log(`🔧 Configurando entorno: ${environment}`);

// Archivos de configuración
const envFiles = {
  development: 'env.development',
  staging: 'env.staging', 
  production: 'env.production'
};

const targetFile = envFiles[environment];

if (!targetFile) {
  console.error(`❌ Entorno no válido: ${environment}`);
  console.log('Entornos disponibles: development, staging, production');
  process.exit(1);
}

// Copiar archivo de entorno
const sourcePath = path.join(__dirname, '..', targetFile);
const targetPath = path.join(__dirname, '..', 'backend', '.env');

if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Archivo no encontrado: ${sourcePath}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`✅ Configuración copiada: ${targetFile} → backend/.env`);

// Mostrar configuración actual
console.log('\n📋 Configuración actual:');
const envContent = fs.readFileSync(targetPath, 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    const maskedValue = key.includes('SECRET') || key.includes('KEY') 
      ? value.substring(0, 8) + '...' 
      : value;
    console.log(`   ${key}=${maskedValue}`);
  }
});

console.log(`\n🚀 Entorno configurado: ${environment}`);
console.log('💡 Reinicia PM2 para aplicar los cambios:');
console.log('   pm2 restart xistracloud-backend');
