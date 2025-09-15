-- =====================================================
-- Script de Inicialización MySQL DEFINITIVO para WordPress
-- =====================================================

-- Esperar a que MySQL esté completamente inicializado
SELECT SLEEP(5);

-- Verificar que estamos usando la base de datos correcta
USE wordpress;

-- Crear tablas básicas de WordPress si no existen
CREATE TABLE IF NOT EXISTS wp_options (
    option_id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    option_name VARCHAR(191) NOT NULL DEFAULT '',
    option_value LONGTEXT NOT NULL,
    autoload VARCHAR(20) NOT NULL DEFAULT 'yes',
    PRIMARY KEY (option_id),
    UNIQUE KEY option_name (option_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asegurar permisos del usuario wordpress
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER, CREATE TEMPORARY TABLES, LOCK TABLES ON wordpress.* TO 'wordpress'@'%';
FLUSH PRIVILEGES;

-- Insertar configuración básica de WordPress
INSERT IGNORE INTO wp_options (option_name, option_value, autoload) VALUES
('siteurl', 'http://localhost:9973', 'yes'),
('home', 'http://localhost:9973', 'yes'),
('blogname', 'wordpress', 'yes'),
('blogdescription', 'chatbot', 'yes'),
('users_can_register', '0', 'yes'),
('admin_email', 'yagomateos@hotmail.com', 'yes'),
('start_of_week', '1', 'yes'),
('use_balanceTags', '0', 'yes'),
('use_smilies', '1', 'yes'),
('require_name_email', '1', 'yes'),
('comments_notify', '1', 'yes'),
('posts_per_rss', '10', 'yes'),
('rss_use_excerpt', '0', 'yes'),
('mailserver_url', 'mail.example.com', 'yes'),
('mailserver_login', 'login@example.com', 'yes'),
('mailserver_pass', 'password', 'yes'),
('mailserver_port', '110', 'yes'),
('default_category', '1', 'yes'),
('default_comment_status', 'open', 'yes'),
('default_ping_status', 'open', 'yes'),
('default_pingback_flag', '1', 'yes'),
('posts_per_page', '10', 'yes'),
('date_format', 'F j, Y', 'yes'),
('time_format', 'g:i a', 'yes'),
('links_updated_date_format', 'F j, Y g:i a', 'yes'),
('comment_moderation', '0', 'yes'),
('moderation_notify', '1', 'yes'),
('permalink_structure', '/%year%/%monthnum%/%day%/%postname%/', 'yes'),
('rewrite_rules', '', 'yes'),
('hack_file', '0', 'yes'),
('blog_charset', 'UTF-8', 'yes'),
('moderation_keys', '', 'no'),
('active_plugins', 'a:0:{}', 'yes'),
('category_base', '', 'yes'),
('ping_sites', 'http://rpc.pingomatic.com/', 'yes'),
('comment_max_links', '2', 'yes'),
('gmt_offset', '0', 'yes'),
('default_email_category', '1', 'yes'),
('recently_edited', '', 'no'),
('template', 'twentytwentyfour', 'yes'),
('stylesheet', 'twentytwentyfour', 'yes'),
('comment_registration', '0', 'yes'),
('html_type', 'text/html', 'yes'),
('use_trackback', '0', 'yes'),
('default_role', 'subscriber', 'yes'),
('db_version', '57155', 'yes'),
('uploads_use_yearmonth_folders', '1', 'yes'),
('upload_path', '', 'yes'),
('blog_public', '1', 'yes'),
('default_link_category', '2', 'yes'),
('show_on_front', 'posts', 'yes'),
('tag_base', '', 'yes'),
('show_avatars', '1', 'yes'),
('avatar_rating', 'G', 'yes'),
('upload_url_path', '', 'yes'),
('thumbnail_size_w', '150', 'yes'),
('thumbnail_size_h', '150', 'yes'),
('thumbnail_crop', '1', 'yes'),
('medium_size_w', '300', 'yes'),
('medium_size_h', '300', 'yes'),
('avatar_default', 'mystery', 'yes'),
('large_size_w', '1024', 'yes'),
('large_size_h', '1024', 'yes'),
('image_default_link_type', 'none', 'yes'),
('image_default_size', '', 'yes'),
('image_default_align', '', 'yes'),
('close_comments_for_old_posts', '0', 'yes'),
('close_comments_days_old', '14', 'yes'),
('thread_comments', '1', 'yes'),
('thread_comments_depth', '5', 'yes'),
('page_comments', '0', 'yes'),
('comments_per_page', '50', 'yes'),
('default_comments_page', 'newest', 'yes'),
('comment_order', 'asc', 'yes'),
('sticky_posts', 'a:0:{}', 'yes'),
('widget_categories', 'a:2:{i:1;a:0:{}s:12:"_multiwidget";i:1;}', 'yes'),
('widget_text', 'a:2:{i:1;a:0:{}s:12:"_multiwidget";i:1;}', 'yes'),
('widget_rss', 'a:2:{i:1;a:0:{}s:12:"_multiwidget";i:1;}', 'yes'),
('uninstall_plugins', 'a:0:{}', 'no'),
('timezone_string', '', 'yes'),
('page_for_posts', '0', 'yes'),
('page_on_front', '0', 'yes'),
('default_post_format', '0', 'yes'),
('link_manager_enabled', '0', 'yes'),
('finished_splitting_shared_terms', '1', 'yes'),
('site_icon', '0', 'yes'),
('medium_large_size_w', '768', 'yes'),
('medium_large_size_h', '0', 'yes'),
('wp_page_for_privacy_policy', '3', 'yes'),
('show_comments_cookies_opt_in', '1', 'yes'),
('admin_email_lifespan', '1772150400', 'yes'),
('disallowed_keys', '', 'no'),
('comment_previously_approved', '1', 'yes'),
('auto_plugin_theme_update_emails', 'a:0:{}', 'no'),
('auto_update_core_dev', 'enabled', 'yes'),
('auto_update_core_minor', 'enabled', 'yes'),
('auto_update_core_major', 'enabled', 'yes'),
('wp_force_deactivated_plugins', 'a:0:{}', 'yes'),
('initial_db_version', '57155', 'yes'),
('wp_user_roles', 'a:5:{s:13:"administrator";a:2:{s:4:"name";s:13:"Administrator";s:12:"capabilities";a:61:{s:13:"switch_themes";b:1;s:11:"edit_themes";b:1;s:16:"activate_plugins";b:1;s:12:"edit_plugins";b:1;s:10:"edit_users";b:1;s:10:"list_users";b:1;s:12:"delete_users";b:1;s:12:"create_users";b:1;s:17:"unfiltered_upload";b:1;s:14:"edit_dashboard";b:1;s:14:"update_plugins";b:1;s:14:"delete_plugins";b:1;s:15:"install_plugins";b:1;s:13:"update_themes";b:1;s:14:"install_themes";b:1;s:11:"update_core";b:1;s:10:"list_users";b:1;s:12:"remove_users";b:1;s:13:"promote_users";b:1;s:18:"edit_theme_options";b:1;s:13:"delete_themes";b:1;s:6:"export";b:1;s:6:"import";b:1;s:4:"read";b:1;s:15:"moderate_comments";b:1;s:17:"manage_categories";b:1;s:12:"manage_links";b:1;s:12:"upload_files";b:1;s:6:"unfiltered_html";b:1;s:10:"edit_posts";b:1;s:17:"edit_others_posts";b:1;s:20:"edit_published_posts";b:1;s:13:"publish_posts";b:1;s:10:"edit_pages";b:1;s:4:"read";b:1;s:8:"level_10";b:1;s:7:"level_9";b:1;s:7:"level_8";b:1;s:7:"level_7";b:1;s:7:"level_6";b:1;s:7:"level_5";b:1;s:7:"level_4";b:1;s:7:"level_3";b:1;s:7:"level_2";b:1;s:7:"level_1";b:1;s:7:"level_0";b:1;s:17:"edit_others_pages";b:1;s:20:"edit_published_pages";b:1;s:13:"publish_pages";b:1;s:12:"delete_pages";b:1;s:19:"delete_others_pages";b:1;s:22:"delete_published_pages";b:1;s:12:"delete_posts";b:1;s:19:"delete_others_posts";b:1;s:22:"delete_published_posts";b:1;s:20:"delete_private_posts";b:1;s:18:"edit_private_posts";b:1;s:18:"read_private_posts";b:1;s:20:"delete_private_pages";b:1;s:18:"edit_private_pages";b:1;s:18:"read_private_pages";b:1;}}s:6:"editor";a:2:{s:4:"name";s:6:"Editor";s:12:"capabilities";a:34:{s:15:"moderate_comments";b:1;s:17:"manage_categories";b:1;s:12:"manage_links";b:1;s:12:"upload_files";b:1;s:10:"unfiltered_html";b:1;s:10:"edit_posts";b:1;s:17:"edit_others_posts";b:1;s:20:"edit_published_posts";b:1;s:13:"publish_posts";b:1;s:10:"edit_pages";b:1;s:4:"read";b:1;s:7:"level_7";b:1;s:7:"level_6";b:1;s:7:"level_5";b:1;s:7:"level_4";b:1;s:7:"level_3";b:1;s:7:"level_2";b:1;s:7:"level_1";b:1;s:7:"level_0";b:1;s:17:"edit_others_pages";b:1;s:20:"edit_published_pages";b:1;s:13:"publish_pages";b:1;s:12:"delete_pages";b:1;s:19:"delete_others_pages";b:1;s:22:"delete_published_pages";b:1;s:12:"delete_posts";b:1;s:19:"delete_others_posts";b:1;s:22:"delete_published_posts";b:1;s:20:"delete_private_posts";b:1;s:18:"edit_private_posts";b:1;s:18:"read_private_posts";b:1;s:20:"delete_private_pages";b:1;s:18:"edit_private_pages";b:1;s:18:"read_private_pages";b:1;}}s:6:"author";a:2:{s:4:"name";s:6:"Author";s:12:"capabilities";a:10:{s:12:"upload_files";b:1;s:10:"edit_posts";b:1;s:20:"edit_published_posts";b:1;s:13:"publish_posts";b:1;s:4:"read";b:1;s:7:"level_2";b:1;s:7:"level_1";b:1;s:7:"level_0";b:1;s:12:"delete_posts";b:1;s:22:"delete_published_posts";b:1;}}s:11:"contributor";a:2:{s:4:"name";s:11:"Contributor";s:12:"capabilities";a:5:{s:10:"edit_posts";b:1;s:4:"read";b:1;s:7:"level_1";b:1;s:7:"level_0";b:1;s:12:"delete_posts";b:1;}}s:10:"subscriber";a:2:{s:4:"name";s:10:"Subscriber";s:12:"capabilities";a:2:{s:4:"read";b:1;s:7:"level_0";b:1;}}}', 'yes'),
('fresh_site', '1', 'yes'),
('WPLANG', 'es_ES', 'yes'),
('new_admin_email', 'yagomateos@hotmail.com', 'yes');

-- Verificación final
SELECT 'Inicialización de WordPress completada correctamente' as status;
SELECT COUNT(*) as total_options FROM wp_options;
SHOW GRANTS FOR 'wordpress'@'%';
