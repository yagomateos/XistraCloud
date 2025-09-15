#!/bin/bash

# XistraCloud VPS Deployment - Actualización completa con sshpass
# Actualiza VPS con código local que incluye diseño glassmorphism y funcionalidad WordPress

set -e

VPS_USER="root"
VPS_HOST="77.37.121.240"
VPS_PATH="/var/www/xistracloud"
LOCAL_PATH="/Users/yagomateos/Proyectos/XistraCloud"

# Solicitar contraseña una sola vez
echo "🔐 Ingresa la contraseña del VPS:"
read -s VPS_PASSWORD

# Función para ejecutar comandos SSH con sshpass
ssh_exec() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "$1"
}

# Función para rsync con sshpass
rsync_exec() {
    sshpass -p "$VPS_PASSWORD" rsync -avz --progress "$@"
}

echo "🚀 XistraCloud - Deployment actualizado al VPS"
echo "📅 Actualizando desde versión Sep 13 → versión actual con glassmorphism"

# 1. Hacer backup del deployment actual
echo "💾 Creando backup del deployment actual..."
ssh_exec "mkdir -p /root/backups && cp -r $VPS_PATH /root/backups/xistracloud-backup-\$(date +%Y%m%d-%H%M)"

# 2. Parar servicios actuales (sin afectar EasyPanel/n8n)
echo "⏸️  Parando backend XistraCloud actual..."
ssh_exec "pkill -f 'node backend.js' || true"
sleep 3

# 3. Actualizar código fuente completo
echo "📁 Subiendo código actualizado..."

# Subir backend completo (con docker-templates y endpoints nuevos)
echo "  📦 Subiendo backend..."
rsync_exec --delete $LOCAL_PATH/backend/ $VPS_USER@$VPS_HOST:$VPS_PATH/backend/

# Subir frontend completo (con AppInstall.tsx glassmorphism)
echo "  🎨 Subiendo frontend..."
rsync_exec --delete $LOCAL_PATH/src/ $VPS_USER@$VPS_HOST:$VPS_PATH/src/

# Subir archivos raíz actualizados
echo "  📄 Subiendo archivos de configuración..."
rsync_exec $LOCAL_PATH/package.json $VPS_USER@$VPS_HOST:$VPS_PATH/
rsync_exec $LOCAL_PATH/vite.config.ts $VPS_USER@$VPS_HOST:$VPS_PATH/
rsync_exec $LOCAL_PATH/tailwind.config.ts $VPS_USER@$VPS_HOST:$VPS_PATH/

# 4. Instalar dependencias actualizadas
echo "📦 Instalando dependencias..."
ssh_exec "cd $VPS_PATH && npm install"
ssh_exec "cd $VPS_PATH/backend && npm install"

# 5. Configurar variables de entorno para VPS
echo "⚙️  Configurando entorno VPS..."
ssh_exec "cd $VPS_PATH && echo 'VITE_API_URL=http://77.37.121.240:3001' > .env.production"

# 6. Build del frontend
echo "🔨 Building frontend..."
ssh_exec "cd $VPS_PATH && npm run build"

# 7. Configurar logs
echo "📝 Configurando logs..."
ssh_exec "mkdir -p /var/log/xistracloud"

# 8. Iniciar backend actualizado
echo "▶️  Iniciando backend actualizado..."
ssh_exec "cd $VPS_PATH/backend && nohup node docker-backend.js > /var/log/xistracloud/backend.log 2>&1 &"

# 9. Verificar deployment
echo "✅ Verificando deployment..."
sleep 5
echo "🔍 Estado del backend:"
ssh_exec "curl -s http://localhost:3001/dashboard/stats || echo 'Backend aún iniciando...'"

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
echo ""
echo "🔧 Para ver logs en tiempo real:"
echo "   ssh root@77.37.121.240 'tail -f /var/log/xistracloud/backend.log'"
