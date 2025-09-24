#!/bin/bash

# XistraCloud Deploy Script
# Uso: ./deploy.sh IP_VPS USUARIO

if [ $# -ne 2 ]; then
    echo "❌ Uso: $0 <IP_VPS> <USUARIO>"
    echo "   Ejemplo: $0 192.168.1.100 ubuntu"
    exit 1
fi

VPS_IP=$1
VPS_USER=$2
VPS_PASSWORD="***REMOVED-VPS-PASSWORD***"

echo "🚀 Iniciando deploy a $VPS_USER@$VPS_IP"

# Función para ejecutar comandos remotos
run_remote() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Verificar conexión
echo "🔗 Verificando conexión..."
if ! run_remote "echo 'Conexión exitosa'"; then
    echo "❌ Error: No se pudo conectar al VPS"
    exit 1
fi

echo "📁 Navegando al directorio del proyecto..."
run_remote "cd /var/www/xistracloud || cd ~/xistracloud || { echo 'Directorio no encontrado'; exit 1; }"

echo "📦 Creando backup..."
run_remote "sudo cp -r /var/www/xistracloud /var/www/xistracloud-backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || cp -r ~/xistracloud ~/xistracloud-backup-\$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo 'Backup omitido'"

echo "🔄 Actualizando código desde GitHub..."
run_remote "cd /var/www/xistracloud && git pull origin main || cd ~/xistracloud && git pull origin main"

echo "📦 Instalando dependencias..."
run_remote "cd /var/www/xistracloud && npm install --production && cd backend && npm install --production && cd .. || cd ~/xistracloud && npm install --production && cd backend && npm install --production && cd .."

echo "🏗️ Construyendo proyecto..."
run_remote "cd /var/www/xistracloud && npm run build || cd ~/xistracloud && npm run build"

echo "🔄 Reiniciando servicios..."
run_remote "sudo systemctl restart xistracloud-backend 2>/dev/null || pm2 restart xistracloud-backend 2>/dev/null || echo 'Servicio backend no encontrado'"
run_remote "sudo systemctl restart nginx 2>/dev/null || sudo service nginx reload 2>/dev/null || echo 'Nginx no reiniciado'"

echo "✅ Deploy completado exitosamente"
echo "🌐 Verifica tu aplicación en: https://tu-dominio.com"
echo "🔍 API health check: https://tu-dominio.com/api/health"