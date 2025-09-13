# 🚀 Guía de Migración a VPS Hostinger

## 📋 Paso a Paso

### 1. **Acceder a tu VPS**
```bash
# Conectar por SSH (te dará Hostinger)
ssh root@tu-vps-ip
# O si tienes usuario:
ssh usuario@tu-vps-ip
```

### 2. **Ejecutar instalación automática**
```bash
# Un solo comando instala todo:
curl -sSL https://raw.githubusercontent.com/yagomateos/XistraCloud/main/deploy/vps-setup.sh | bash
```

### 3. **Configurar variables de entorno**
```bash
cd /var/www/xistracloud/backend
nano .env
```

Agregar:
```env
# Supabase (mantener la actual)
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key

# Configuración del servidor
NODE_ENV=production
PORT=3001
DOMAIN=xistracloud.sinaptiks.com

# Docker
DOCKER_SOCKET=/var/run/docker.sock
```

### 4. **Configurar DNS en Hostinger**
En el panel de Hostinger, agregar:
- `xistracloud.sinaptiks.com` → IP de tu VPS
- `apps.sinaptiks.com` → IP de tu VPS (para las apps)

### 5. **Activar SSL**
```bash
sudo certbot --nginx -d xistracloud.sinaptiks.com -d apps.sinaptiks.com
```

## 🔧 **Arquitectura Final**

```
sinaptiks.com (tu web actual)
├── xistracloud.sinaptiks.com (plataforma)
│   ├── /api/* → Backend Node.js (puerto 3001)
│   └── /* → Frontend React (Vercel o local)
└── apps.sinaptiks.com (apps deployadas)
    ├── /wordpress → WordPress (puerto 8080)
    ├── /nextcloud → Nextcloud (puerto 8081)
    └── /[app-name] → Otras apps...
```

## 💰 **Ventajas de tu VPS actual**

✅ **Ya está pagado** - Sin costos adicionales
✅ **Control total** - Puedes instalar lo que necesites
✅ **Docker disponible** - Para deployments reales
✅ **SSL incluido** - Con Let's Encrypt
✅ **Dominio funcionando** - sinaptiks.com ya resuelve
✅ **Mejor rendimiento** - Sin limitaciones de Railway/Vercel

## 🚨 **¿Qué pasa con Railway y Vercel?**

- **Frontend**: Puede quedarse en Vercel (es gratis y rápido)
- **Backend**: Se muda a tu VPS (control total)
- **Base de datos**: Supabase se mantiene (ya funciona)

## ⚡ **Resultado Final**

Tu plataforma XistraCloud funcionará como un hosting profesional:
- Panel en `xistracloud.sinaptiks.com`
- Apps desplegadas en `apps.sinaptiks.com/wordpress`, etc.
- Todo corriendo en tu VPS con Docker real
- Sin limitaciones de tiempo o recursos
