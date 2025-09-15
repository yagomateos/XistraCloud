#!/bin/bash

# XistraCloud - Configuración inicial VPS Hostinger
# Instala Docker, Docker Compose y prepara el entorno para deployment

set -e

echo "🚀 XistraCloud - Configurando VPS Hostinger..."

# 1. Actualizar sistema
echo "📦 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias
echo "🔧 Instalando dependencias..."
sudo apt install -y curl wget git htop nano ufw

# 3. Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Instalar Docker Compose
echo "🔧 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Instalar Node.js (para el backend)
echo "📱 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 6. Configurar firewall básico
echo "🔥 Configurando firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001
echo "y" | sudo ufw enable

# 7. Crear directorios para XistraCloud
echo "📁 Creando estructura de directorios..."
mkdir -p /home/$USER/xistracloud/{backend,deployed-apps,nginx,ssl}

# 8. Instalar Nginx (reverse proxy)
echo "🌐 Instalando Nginx..."
sudo apt install -y nginx

echo "✅ Instalación completada!"
echo ""
echo "🔄 IMPORTANTE: Ejecuta 'newgrp docker' o reinicia la sesión para aplicar permisos Docker"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir tu código XistraCloud al VPS"
echo "2. Configurar dominio y SSL"
echo "3. Ejecutar ./configure-nginx.sh"
echo "4. Iniciar el backend con Docker completo"
