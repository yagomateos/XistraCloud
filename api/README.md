# Deployment en Hostinger - Backend API

## Pasos para deployar el backend:

### 1. Preparar los archivos
Los archivos en la carpeta `/api/` son los que debes subir a Hostinger:
- `index.js` - Servidor principal
- `package.json` - Dependencias
- `.htaccess` - Configuración Apache

### 2. Subir a Hostinger
1. Ir al File Manager de Hostinger
2. Navegar a `public_html/api/` (crear la carpeta `api` si no existe)
3. Subir todos los archivos de la carpeta `/api/`

### 3. Instalar dependencias
En el terminal de Hostinger ejecutar:
```bash
cd public_html/api
npm install
```

### 4. Configurar Node.js en Hostinger
1. Ir al panel de control de Hostinger
2. Buscar "Node.js" en las herramientas
3. Crear una nueva aplicación Node.js:
   - **Application root**: `/public_html/api`
   - **Application URL**: `tu-dominio.com/api`
   - **Startup file**: `index.js`
   - **Node.js version**: 18.x o superior

### 5. Actualizar frontend
En el archivo `.env.production` cambiar:
```
VITE_API_URL=https://tu-dominio-real.com/api
```

### 6. Deploy frontend
```bash
npm run build
vercel --prod
```

## URLs finales:
- **Frontend**: https://xistracloud-xxx.vercel.app
- **Backend API**: https://tu-dominio.com/api
- **Test API**: https://tu-dominio.com/api/health

## Endpoints disponibles:
- `GET /` - Health check
- `GET /health` - Status del servidor
- `GET /apps/templates` - Lista de templates disponibles
- `POST /apps/deploy` - Deploy una aplicación
- `GET /apps/deployed` - Lista apps desplegadas
- `GET /dashboard/stats` - Estadísticas del dashboard

## Funcionalidad:
- ✅ Misma funcionalidad que localhost
- ✅ Templates de WordPress, MySQL, etc.
- ✅ Deploy simulado (funcional para demo)
- ✅ Dashboard stats en tiempo real
- ✅ CORS habilitado
- ✅ Compatible con Hostinger shared hosting
