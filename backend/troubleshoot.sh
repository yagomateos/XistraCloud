#!/bin/bash
# =====================================================
# TROUBLESHOOTING TOOLKIT DEFINITIVO para WordPress + MySQL
# =====================================================

APP_NAME="miwp-yago"  # Cambiar por el nombre de tu app

echo "🔍 TROUBLESHOOTING TOOLKIT DEFINITIVO"
echo "====================================="

# 1. VERIFICAR ESTADO DE CONTENEDORES
echo ""
echo "📦 1. ESTADO DE CONTENEDORES:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep $APP_NAME

# 2. VERIFICAR HEALTH CHECKS
echo ""
echo "🏥 2. HEALTH CHECKS:"
docker inspect ${APP_NAME}-mysql --format='{{json .State.Health}}' | jq '.'
docker inspect ${APP_NAME}-wordpress --format='{{json .State.Health}}' | jq '.'

# 3. VERIFICAR CONECTIVIDAD DE RED
echo ""
echo "🌐 3. CONECTIVIDAD DE RED:"
docker network ls | grep $APP_NAME
docker network inspect ${APP_NAME}_${APP_NAME}-network --format='{{json .Containers}}' | jq '.'

# 4. LOGS RECIENTES
echo ""
echo "📝 4. LOGS MYSQL (últimas 10 líneas):"
docker logs ${APP_NAME}-mysql --tail 10

echo ""
echo "📝 5. LOGS WORDPRESS (últimas 10 líneas):"
docker logs ${APP_NAME}-wordpress --tail 10

# 6. VERIFICAR MYSQL DIRECTAMENTE
echo ""
echo "🔐 6. VERIFICAR MYSQL DIRECTAMENTE:"
echo "Verificando acceso root..."
docker exec ${APP_NAME}-mysql mysql -uroot -prootpassword123 -e "SHOW DATABASES;"

echo ""
echo "Verificando usuario wordpress..."
docker exec ${APP_NAME}-mysql mysql -uroot -prootpassword123 -e "SELECT User, Host FROM mysql.user WHERE User='wordpress';"

echo ""
echo "Verificando permisos de wordpress..."
docker exec ${APP_NAME}-mysql mysql -uroot -prootpassword123 -e "SHOW GRANTS FOR 'wordpress'@'%';"

# 7. TEST DE CONEXIÓN DESDE WORDPRESS
echo ""
echo "🔗 7. TEST DE CONEXIÓN DESDE WORDPRESS:"
docker exec ${APP_NAME}-wordpress php -r "
\$host = '${APP_NAME}-mysql';
\$user = 'wordpress';
\$pass = 'wordpresspass123';
\$db = 'wordpress';

echo 'Intentando conectar a MySQL...' . PHP_EOL;
\$link = mysqli_connect(\$host, \$user, \$pass, \$db);
if (\$link) {
    echo '✅ Conexión exitosa!' . PHP_EOL;
    echo 'Versión MySQL: ' . mysqli_get_server_info(\$link) . PHP_EOL;
    
    \$result = mysqli_query(\$link, 'SELECT COUNT(*) as total FROM information_schema.tables WHERE table_schema = \"wordpress\"');
    \$row = mysqli_fetch_assoc(\$result);
    echo 'Tablas en wordpress: ' . \$row['total'] . PHP_EOL;
    
    mysqli_close(\$link);
} else {
    echo '❌ Error de conexión: ' . mysqli_connect_error() . PHP_EOL;
}
"

# 8. VERIFICAR ARCHIVOS DE CONFIGURACIÓN
echo ""
echo "📋 8. VERIFICAR ARCHIVOS DE CONFIGURACIÓN:"
echo "Verificando wp-config.php..."
docker exec ${APP_NAME}-wordpress ls -la /var/www/html/wp-config.php
echo ""
echo "Contenido de wp-config.php (primeras 20 líneas):"
docker exec ${APP_NAME}-wordpress head -20 /var/www/html/wp-config.php

# 9. VERIFICAR VOLÚMENES
echo ""
echo "💾 9. VERIFICAR VOLÚMENES:"
docker volume ls | grep $APP_NAME
docker volume inspect ${APP_NAME}_${APP_NAME}-mysql-data
docker volume inspect ${APP_NAME}_${APP_NAME}-wp-data

# 10. TEST HTTP
echo ""
echo "🌐 10. TEST HTTP:"
PORT=$(docker port ${APP_NAME}-wordpress 80/tcp | cut -d: -f2)
echo "Puerto WordPress: $PORT"
echo "Testeando HTTP..."
curl -I -s -m 5 http://localhost:$PORT/ || echo "❌ No se puede conectar via HTTP"

# 11. PROCESOS DENTRO DE CONTENEDORES
echo ""
echo "⚙️ 11. PROCESOS ACTIVOS:"
echo "Procesos en MySQL:"
docker exec ${APP_NAME}-mysql ps aux | head -5

echo ""
echo "Procesos en WordPress:"
docker exec ${APP_NAME}-wordpress ps aux | head -5

# 12. ESPACIO EN DISCO
echo ""
echo "💽 12. ESPACIO EN DISCO:"
docker system df
echo ""
echo "Uso de volúmenes:"
docker exec ${APP_NAME}-mysql df -h /var/lib/mysql
docker exec ${APP_NAME}-wordpress df -h /var/www/html

echo ""
echo "🎉 TROUBLESHOOTING COMPLETADO!"
echo "================================"
