#!/bin/bash

# XistraCloud VPS Deployment - Actualización completa
# Actualiza VPS con código local que incluye diseño glassmorphism y funcionalidad WordPress

set -e

VPS_USER="root"
VPS_HOST="77.37.121.240"
VPS_PATH="/var/www/xistracloud"
LOCAL_PATH="/Users/yagomateos/Proyectos/XistraCloud"

echo "🚀 XistraCloud - Deployment actualizado al VPS"
echo "📅 Actualizando desde versión Sep 13 → versión actual con glassmorphism"

# 1. Hacer backup del deployment actual
echo "💾 Creando backup del deployment actual..."
ssh $VPS_USER@$VPS_HOST "mkdir -p /root/backups && cp -r $VPS_PATH /root/backups/xistracloud-backup-$(date +%Y%m%d-%H%M)"

# 2. Parar servicios actuales (sin afectar EasyPanel/n8n)
echo "⏸️  Parando backend XistraCloud actual..."
ssh $VPS_USER@$VPS_HOST "pkill -f 'node backend.js' || true"
sleep 3

# 3. Actualizar código fuente completo
echo "📁 Subiendo código actualizado..."

# Subir backend completo (con docker-templates y endpoints nuevos)
rsync -avz --progress --delete $LOCAL_PATH/backend/ $VPS_USER@$VPS_HOST:$VPS_PATH/backend/

# Subir frontend completo (con AppInstall.tsx glassmorphism)
rsync -avz --progress --delete $LOCAL_PATH/src/ $VPS_USER@$VPS_HOST:$VPS_PATH/src/

# Subir archivos raíz actualizados
rsync -avz --progress $LOCAL_PATH/package.json $VPS_USER@$VPS_HOST:$VPS_PATH/
rsync -avz --progress $LOCAL_PATH/vite.config.ts $VPS_USER@$VPS_HOST:$VPS_PATH/
rsync -avz --progress $LOCAL_PATH/tailwind.config.ts $VPS_USER@$VPS_HOST:$VPS_PATH/

# 4. Instalar dependencias actualizadas
echo "📦 Instalando dependencias..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm install"
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH/backend && npm install"

# 5. Configurar variables de entorno para VPS
echo "⚙️  Configurando entorno VPS..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && echo 'VITE_API_URL=http://77.37.121.240:3001' > .env.production"

# 6. Build del frontend
echo "🔨 Building frontend..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH && npm run build"

# 7. Configurar nginx/reverse proxy si es necesario
echo "🌐 Configurando acceso web..."
ssh $VPS_USER@$VPS_HOST "mkdir -p /var/log/xistracloud"

# 8. Iniciar backend actualizado
echo "▶️  Iniciando backend actualizado..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH/backend && nohup node docker-backend.js > /var/log/xistracloud/backend.log 2>&1 &"

# 9. Verificar deployment
echo "✅ Verificando deployment..."
sleep 5
ssh $VPS_USER@$VPS_HOST "curl -s http://localhost:3001/dashboard/stats || echo 'Backend aún iniciando...'"

echo ""
echo "🎉 Deployment completado!"
echo "📊 Backend: http://77.37.121.240:3001"
echo "🎨 Frontend: http://77.37.121.240 (a través de EasyPanel/Traefik)"
echo "📝 Logs: /var/log/xistracloud/backend.log"
echo ""
echo "✨ Funcionalidades nuevas disponibles:"
echo "  • Diseño glassmorphism increíble en AppInstall"
echo "  • WordPress deployment con Docker real"
echo "  • Dashboard con datos reales (sin mocks)"
echo "  • Templates completos (WordPress, n8n, Next.js, etc.)"
