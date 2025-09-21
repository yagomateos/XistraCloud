#!/bin/bash

echo "🚀 Desplegando a PRODUCCIÓN..."

# Configurar entorno de producción
node scripts/set-env.js production

# Construir frontend
echo "📦 Construyendo frontend..."
npm run build

# Copiar archivos a directorio de producción
echo "📁 Copiando archivos..."
sudo cp -r dist/* /var/www/xistracloud.com/

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
pm2 restart xistracloud-backend

echo "✅ Producción desplegada en: https://xistracloud.com"
echo "💰 Modo LIVE activado - solo tarjetas reales"
