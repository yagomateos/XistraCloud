#!/bin/bash
set -e

# Función para instalar WordPress automáticamente
install_wordpress() {
    if [ ! -f /var/www/html/wp-config.php ]; then
        echo "WordPress no configurado, ejecutando instalación automática..."
        
        # Esperar a que MySQL esté disponible
        while ! mysqladmin ping -h"${WORDPRESS_DB_HOST%:*}" -P"${WORDPRESS_DB_HOST#*:}" --silent; do
            echo 'Esperando MySQL...'
            sleep 2
        done
        
        echo 'MySQL disponible, instalando WordPress...'
        
        # Descargar WP-CLI
        curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/v2.8.1/wp-cli.phar
        chmod +x wp-cli.phar
        mv wp-cli.phar /usr/local/bin/wp
        
        # Descargar WordPress
        wp core download --allow-root --path=/var/www/html
        
        # Crear wp-config.php
        wp config create \
            --dbname="$WORDPRESS_DB_NAME" \
            --dbuser="$WORDPRESS_DB_USER" \
            --dbpass="$WORDPRESS_DB_PASSWORD" \
            --dbhost="$WORDPRESS_DB_HOST" \
            --allow-root \
            --path=/var/www/html
            
        # Agregar configuraciones extra
        if [ -n "$WORDPRESS_CONFIG_EXTRA" ]; then
            echo "$WORDPRESS_CONFIG_EXTRA" >> /var/www/html/wp-config.php
        fi
        
        # Instalar WordPress
        wp core install \
            --url="$WORDPRESS_URL" \
            --title="$WORDPRESS_TITLE" \
            --admin_user="$WORDPRESS_ADMIN_USER" \
            --admin_password="$WORDPRESS_ADMIN_PASSWORD" \
            --admin_email="$WORDPRESS_ADMIN_EMAIL" \
            --skip-email \
            --allow-root \
            --path=/var/www/html
            
        echo "WordPress instalado automáticamente!"
        echo "URL: $WORDPRESS_URL"
        echo "Admin: $WORDPRESS_ADMIN_USER"
        echo "Password: $WORDPRESS_ADMIN_PASSWORD"
        echo "Email: $WORDPRESS_ADMIN_EMAIL"
    fi
}

# Ejecutar la instalación automática en background
install_wordpress &

# Ejecutar el entrypoint original de WordPress
exec docker-entrypoint.sh apache2-foreground