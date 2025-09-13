#!/bin/bash

# 🚀 XistraCloud VPS Setup Script para Hostinger
# Ejecutar como: curl -sSL https://raw.githubusercontent.com/yagomateos/XistraCloud/main/deploy/vps-setup.sh | bash

set -e

echo "🚀 Iniciando instalación de XistraCloud en VPS Hostinger..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en un VPS
log "Verificando sistema..."
if ! command -v apt-get &> /dev/null && ! command -v yum &> /dev/null; then
    error "Este script requiere Ubuntu/Debian o CentOS/RHEL"
fi

# Detectar el sistema operativo
if command -v apt-get &> /dev/null; then
    OS="ubuntu"
    PKG_MANAGER="apt-get"
    PKG_UPDATE="apt-get update"
    PKG_INSTALL="apt-get install -y"
elif command -v yum &> /dev/null; then
    OS="centos"
    PKG_MANAGER="yum"
    PKG_UPDATE="yum update -y"
    PKG_INSTALL="yum install -y"
fi

log "Sistema detectado: $OS"

# Actualizar sistema
log "Actualizando sistema..."
sudo $PKG_UPDATE

# Instalar dependencias básicas
log "Instalando dependencias básicas..."
if [ "$OS" = "ubuntu" ]; then
    sudo $PKG_INSTALL curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
elif [ "$OS" = "centos" ]; then
    sudo $PKG_INSTALL curl wget git unzip yum-utils device-mapper-persistent-data lvm2
fi

# Instalar Node.js 20
log "Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo $PKG_INSTALL nodejs

# Verificar instalación de Node.js
node_version=$(node --version)
npm_version=$(npm --version)
log "Node.js instalado: $node_version"
log "npm instalado: $npm_version"

# Instalar Docker
log "Instalando Docker..."
if [ "$OS" = "ubuntu" ]; then
    # Docker para Ubuntu
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
elif [ "$OS" = "centos" ]; then
    # Docker para CentOS
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose (standalone)
log "Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar Docker
docker --version
docker-compose --version

# Instalar PM2 para gestión de procesos
log "Instalando PM2..."
sudo npm install -g pm2

# Crear directorio de aplicación
log "Creando estructura de directorios..."
sudo mkdir -p /var/www/xistracloud
sudo chown -R $USER:$USER /var/www/xistracloud
cd /var/www/xistracloud

# Clonar repositorio
log "Clonando XistraCloud..."
git clone https://github.com/yagomateos/XistraCloud.git .

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
cd /var/www/xistracloud/backend
npm install

# Crear archivo de configuración PM2
log "Creando configuración PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'xistracloud-backend',
    script: 'server.js',
    cwd: '/var/www/xistracloud/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: '/var/log/xistracloud/combined.log',
    out_file: '/var/log/xistracloud/out.log',
    error_file: '/var/log/xistracloud/error.log',
    time: true
  }]
};
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/xistracloud
sudo chown -R $USER:$USER /var/log/xistracloud

# Instalar Nginx
log "Instalando y configurando Nginx..."
sudo $PKG_INSTALL nginx

# Crear configuración de Nginx para XistraCloud
sudo tee /etc/nginx/sites-available/xistracloud << 'EOF'
server {
    listen 80;
    server_name xistracloud.sinaptiks.com apps.sinaptiks.com;

    # Frontend estático (opcional, puede seguir en Vercel)
    location / {
        proxy_pass https://xistracloud.vercel.app;
        proxy_set_header Host xistracloud.vercel.app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_cache off;
    }

    # Apps deployadas (puertos dinámicos)
    location ~ ^/app/([^/]+)/(.*)$ {
        set $app_name $1;
        # Proxy dinámico basado en el nombre de la app
        proxy_pass http://localhost:8080/$2;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/xistracloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall
log "Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 3001
    sudo ufw allow 8080:8099/tcp  # Rango para apps
    sudo ufw --force enable
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=22/tcp
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --permanent --add-port=3001/tcp
    sudo firewall-cmd --permanent --add-port=8080-8099/tcp
    sudo firewall-cmd --reload
fi

# Crear script de inicio automático
log "Configurando inicio automático..."
cat > /var/www/xistracloud/start.sh << 'EOF'
#!/bin/bash
cd /var/www/xistracloud/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
EOF

chmod +x /var/www/xistracloud/start.sh

# Ejecutar la aplicación
log "Iniciando XistraCloud..."
cd /var/www/xistracloud/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Instalar SSL (Let's Encrypt) - Opcional
log "¿Deseas instalar certificados SSL automáticos? (Recomendado)"
read -p "Instalar SSL con Let's Encrypt? (y/N): " install_ssl
if [[ $install_ssl =~ ^[Yy]$ ]]; then
    sudo $PKG_INSTALL certbot python3-certbot-nginx
    log "Para configurar SSL, ejecuta después:"
    log "sudo certbot --nginx -d xistracloud.sinaptiks.com -d apps.sinaptiks.com"
fi

log "🎉 ¡Instalación completada!"
log ""
log "📋 Resumen de la instalación:"
log "• Backend corriendo en: http://tu-vps-ip:3001"
log "• Nginx configurado para: xistracloud.sinaptiks.com"
log "• Docker instalado y listo"
log "• PM2 gestionando el proceso"
log ""
log "🔧 Próximos pasos:"
log "1. Configurar DNS: xistracloud.sinaptiks.com -> IP de tu VPS"
log "2. Configurar variables de entorno en /var/www/xistracloud/backend/.env"
log "3. Ejecutar SSL: sudo certbot --nginx -d xistracloud.sinaptiks.com"
log ""
log "📊 Comandos útiles:"
log "• Ver logs: pm2 logs xistracloud-backend"
log "• Reiniciar: pm2 restart xistracloud-backend"
log "• Estado: pm2 status"
log "• Ver apps Docker: docker ps"
log ""
log "🌐 Accede a tu plataforma en: http://xistracloud.sinaptiks.com"
