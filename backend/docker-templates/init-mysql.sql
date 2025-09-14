-- Esperar a que MySQL esté completamente inicializado
-- Eliminar usuario si existe y recrearlo con permisos correctos
DROP USER IF EXISTS 'wordpress'@'%';
CREATE USER 'wordpress'@'%' IDENTIFIED BY 'MYSQL_PASSWORD_PLACEHOLDER';
GRANT ALL PRIVILEGES ON *.* TO 'wordpress'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Asegurar que la base de datos wordpress existe
DROP DATABASE IF EXISTS wordpress;
CREATE DATABASE wordpress DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
