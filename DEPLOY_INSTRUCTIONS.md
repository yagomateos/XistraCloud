# 🚀 Instrucciones Urgentes de Deploy - Backend

## ❌ **PROBLEMA ACTUAL**
El backend NO está ejecutándose en producción. Los endpoints `/api/team/members`, `/api/backups`, etc. devuelven 404.

## ✅ **SOLUCIÓN**

### 1. Conectar al VPS
```bash
ssh tu-usuario@tu-ip-vps
```

### 2. Instalar/configurar el servicio systemd
```bash
# Copiar el archivo de servicio
sudo cp /var/www/xistracloud/backend/xistracloud-backend.service /etc/systemd/system/

# Recargar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar el servicio
sudo systemctl enable xistracloud-backend
sudo systemctl start xistracloud-backend

# Verificar que está corriendo
sudo systemctl status xistracloud-backend
```

### 3. Configurar Nginx
```bash
# Copiar configuración de nginx
sudo cp /var/www/xistracloud/nginx-xistracloud.conf /etc/nginx/sites-available/xistracloud

# Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/xistracloud /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

### 4. Verificar archivos de producción
```bash
cd /var/www/xistracloud/backend

# Verificar que existen los archivos de datos
ls -la user-data.json users.json

# Verificar permisos
sudo chown -R www-data:www-data /var/www/xistracloud/backend
sudo chmod -R 755 /var/www/xistracloud/backend
sudo chmod 666 /var/www/xistracloud/backend/user-data.json
sudo chmod 666 /var/www/xistracloud/backend/users.json
```

### 5. Variables de entorno
```bash
# Crear/editar .env en backend
cd /var/www/xistracloud/backend
sudo nano .env

# Contenido mínimo:
NODE_ENV=production
PORT=3001
JWT_SECRET=tu-secret-super-seguro-para-jwt-tokens
```

### 6. Verificar funcionamiento
```bash
# Logs del backend
sudo journalctl -u xistracloud-backend -f

# Test del API
curl -H "x-user-email: yagomateos@hotmail.com" http://localhost:3001/team/members

# Test desde el navegador
curl https://xistracloud.com/api/team/members
```

## 🔧 **COMANDOS DE DEBUG**

Si algo falla:

```bash
# Ver logs del backend
sudo journalctl -u xistracloud-backend --no-pager -l

# Ver logs de nginx
sudo tail -f /var/log/nginx/error.log

# Verificar puerto 3001
sudo netstat -tlnp | grep 3001

# Probar backend manualmente
cd /var/www/xistracloud/backend
NODE_ENV=production node server.js
```

## ⚡ **RESULTADO ESPERADO**

Después de estos pasos:
- ✅ `https://xistracloud.com/api/team/members` debe devolver datos JSON
- ✅ `https://xistracloud.com/api/backups` debe devolver lista de backups
- ✅ Las páginas de equipo, variables y backups deben funcionar en el frontend

## 🚨 **NOTA IMPORTANTE**

Los archivos `user-data.json` y `users.json` del backend contienen los datos de usuarios y proyectos. **¡Hacer backup antes de hacer cambios!**

```bash
cp /var/www/xistracloud/backend/user-data.json /var/www/xistracloud/backend/user-data.json.backup
cp /var/www/xistracloud/backend/users.json /var/www/xistracloud/backend/users.json.backup
```