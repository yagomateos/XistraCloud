#!/bin/bash

echo "🚀 Desplegando a STAGING..."

# Configurar entorno de staging
node scripts/set-env.js staging

# Construir frontend
echo "📦 Construyendo frontend..."
npm run build

# Copiar archivos a directorio de staging
echo "📁 Copiando archivos..."
sudo cp -r dist/* /var/www/test.xistracloud.com/

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
pm2 restart xistracloud-backend

echo "✅ Staging desplegado en: https://test.xistracloud.com"
echo "🧪 Modo TEST activado - puedes usar tarjetas de prueba"
