# 🚀 Guía de Deploy XistraCloud

## Opción 1: GitHub Actions (Recomendado)

### 1. Configurar Secrets en GitHub:
Ve a tu repositorio → Settings → Secrets and variables → Actions

```
VPS_HOST=tu-ip-del-vps
VPS_USER=tu-usuario
VPS_PASSWORD=9Y0bl,#JE'bYBKCif9@H
VPS_PORT=22
```

### 2. El workflow se ejecutará automáticamente en cada push a main

## Opción 2: Deploy Manual

### Conectar al VPS:
```bash
ssh tu-usuario@tu-ip
```

### En el VPS:
```bash
# Ir al directorio del proyecto
cd /var/www/xistracloud

# Actualizar código
git pull origin main

# Instalar dependencias
npm install --production
cd backend && npm install --production && cd ..

# Build frontend
npm run build

# Reiniciar servicios
sudo systemctl restart xistracloud-backend
sudo systemctl restart nginx
```

## Opción 3: Script de Deploy Local

Ejecuta desde tu máquina:
```bash
./deploy.sh tu-ip-del-vps tu-usuario
```

## Variables de Entorno en VPS

Asegúrate de tener en tu VPS:
```bash
# ~/.env o /var/www/xistracloud/backend/.env
NODE_ENV=production
PORT=3001
DATABASE_URL=tu_db_url
JWT_SECRET=tu_jwt_secret
```

## Verificar Deploy
- Frontend: https://tu-dominio.com
- API: https://tu-dominio.com/api/health
- Logs: `sudo journalctl -u xistracloud-backend -f`