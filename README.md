# 🌩️ XistraCloud

> **Plataforma Moderna de Despliegue en la Nube** - Despliega, administra y escala tus aplicaciones sin esfuerzo

[![Demo en Vivo](https://img.shields.io/badge/Demo%20en%20Vivo-xistracloud.com-brightgreen)](https://xistracloud.com)
[![API Backend](https://img.shields.io/badge/API-xistracloud.com/api-blue)](https://xistracloud.com/api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue)](https://docker.com/)

## 🚀 Descripción General

XistraCloud es una plataforma integral de despliegue en la nube que proporciona una interfaz intuitiva para desplegar aplicaciones, gestionar bases de datos y administrar proyectos en múltiples entornos. Construida con tecnologías modernas y diseñada para escalabilidad empresarial.

### ✨ Características Principales

- **🚀 Despliegue Instantáneo** - Despliega aplicaciones con un solo clic desde nuestro catálogo
- **🗄️ Bases de Datos** - MySQL, PostgreSQL y Redis con paneles de administración
- **🌐 Subdominios Automáticos** - Cada app recibe un subdominio único automáticamente
- **🔧 Variables de Entorno** - Gestión completa de configuración por proyecto
- **👥 Colaboración en Equipo** - Sistema de permisos y gestión de miembros
- **💾 Backups Automáticos** - Sistema de respaldos programados y manuales
- **📊 Monitoreo en Tiempo Real** - Métricas del sistema y logs detallados
- **🔗 Webhooks de GitHub** - Despliegues automáticos desde repositorios Git
- **🎨 Interfaz Moderna** - UI limpia construida con React + shadcn/ui
- **📱 Totalmente Responsivo** - Funciona perfectamente en todos los dispositivos

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - React moderno con hooks y suspense
- **TypeScript** - Seguridad de tipos completa
- **Vite** - Herramienta de construcción ultrarrápida
- **TanStack Query** - Gestión de estado del servidor
- **shadcn/ui** - Componentes hermosos y accesibles
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos hermosos

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web rápido
- **TypeScript** - Backend con seguridad de tipos
- **PostgreSQL** - Base de datos relacional robusta
- **Docker** - Containerización de aplicaciones
- **PM2** - Gestión de procesos en producción

### Infraestructura
- **VPS Ubuntu** - Servidor dedicado de alto rendimiento
- **Nginx** - Proxy reverso y servidor web
- **Let's Encrypt** - Certificados SSL automáticos
- **Docker Compose** - Orquestación de contenedores
- **PostgreSQL** - Base de datos principal

## 📦 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- Git instalado
- Docker instalado (para desarrollo local)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/yagomateos/XistraCloud.git
cd XistraCloud
```

### 2. Instalar Dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
```

### 3. Configuración del Entorno
```bash
# Frontend (.env.local)
VITE_API_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL=postgresql://xistracloud_user:xistracloud2025@localhost:5432/xistracloud_db
PORT=3001
GITHUB_WEBHOOK_SECRET=tu_secreto_webhook
```

### 4. Iniciar Servidores de Desarrollo
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm start
```

¡Visita `http://localhost:5173` para ver la aplicación en acción! 🎉

## 🌐 Demo en Vivo

- **Frontend**: [https://xistracloud.com](https://xistracloud.com)
- **API Backend**: [https://xistracloud.com/api](https://xistracloud.com/api)
- **Salud de la API**: [https://xistracloud.com/api/health](https://xistracloud.com/api/health)

## 📚 Documentación de la API

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Verificación de salud de la API |
| `GET` | `/projects` | Listar todos los proyectos |
| `POST` | `/projects` | Crear nuevo proyecto |
| `PUT` | `/projects/:id` | Actualizar proyecto |
| `DELETE` | `/projects/:id` | Eliminar proyecto |
| `GET` | `/deployments` | Listar todos los despliegues |
| `POST` | `/apps/deploy` | Desplegar aplicación |
| `GET` | `/database/services` | Listar servicios de base de datos |
| `POST` | `/database/services` | Crear servicio de base de datos |
| `GET` | `/backups` | Listar backups |
| `GET` | `/team/members` | Listar miembros del equipo |
| `GET` | `/system/metrics` | Métricas del sistema |

### Ejemplo de Uso de la API

```bash
# Obtener todos los proyectos
curl https://xistracloud.com/api/projects

# Desplegar aplicación WordPress
curl -X POST https://xistracloud.com/api/apps/deploy \
  -H "Content-Type: application/json" \
  -d '{"templateId":"wordpress-mysql","name":"mi-blog"}'

# Crear servicio MySQL
curl -X POST https://xistracloud.com/api/database/services \
  -H "Content-Type: application/json" \
  -d '{"type":"mysql","name":"mi-mysql"}'
```

## 🏗️ Estructura del Proyecto

```
XistraCloud/
├── 📁 src/                    # Código fuente del frontend
│   ├── 📁 components/         # Componentes UI reutilizables
│   ├── 📁 pages/             # Páginas de la aplicación
│   │   ├── 📄 Apps.tsx       # Catálogo de aplicaciones
│   │   ├── 📄 Deployments.tsx # Gestión de despliegues
│   │   ├── 📄 DatabaseServices.tsx # Servicios de BD
│   │   ├── 📄 EnvironmentVariables.tsx # Variables de entorno
│   │   ├── 📄 Backups.tsx    # Sistema de backups
│   │   ├── 📄 Team.tsx       # Colaboración en equipo
│   │   ├── 📄 Logs.tsx       # Monitoreo y logs
│   │   └── 📄 Domains.tsx    # Gestión de dominios
│   ├── 📁 hooks/             # Hooks personalizados de React
│   ├── 📁 lib/               # Utilidades y cliente API
│   └── 📁 layouts/           # Layouts de páginas
├── 📁 backend/               # Servidor API del backend
│   ├── 📄 server.js          # Servidor Express principal
│   ├── 📄 database.js        # Cliente PostgreSQL
│   ├── 📄 package.json       # Dependencias del backend
│   └── 📁 migrations/        # Migraciones de base de datos
├── 📁 database/              # Esquemas y migraciones
│   └── 📄 schema.sql         # Esquema de PostgreSQL
├── 📁 awesome-compose/       # Templates de Docker Compose
│   ├── 📁 wordpress-mysql/   # WordPress + MySQL
│   ├── 📁 mysql-standalone/  # MySQL standalone
│   ├── 📁 postgresql-standalone/ # PostgreSQL standalone
│   └── 📁 redis-standalone/  # Redis standalone
├── 📁 public/                # Recursos estáticos
├── 📄 package.json           # Dependencias del frontend
├── 📄 tailwind.config.ts     # Configuración de Tailwind
├── 📄 vite.config.ts         # Configuración de Vite
└── 📄 README.md              # Este archivo
```

## 🚀 Catálogo de Aplicaciones

### Aplicaciones Disponibles
- **WordPress** - CMS más popular del mundo
- **Nextcloud** - Plataforma de colaboración
- **Gitea** - Servicio Git auto-hospedado
- **Portainer** - Gestión de contenedores Docker
- **Prometheus + Grafana** - Monitoreo y métricas
- **Minecraft Server** - Servidor de Minecraft
- **Plex Media Server** - Servidor multimedia
- **WireGuard VPN** - Servidor VPN seguro
- **Pi-hole** - Bloqueador de anuncios

### Servicios de Base de Datos
- **MySQL** - Base de datos relacional con phpMyAdmin
- **PostgreSQL** - Base de datos avanzada con pgAdmin
- **Redis** - Base de datos en memoria con Redis Commander

## 🧪 Estadísticas Actuales (Datos en Vivo)

- **Proyectos**: 8+ proyectos desplegados
- **Servicios de BD**: MySQL, PostgreSQL, Redis disponibles
- **Dominios**: Sistema de subdominios automáticos activo
- **Registros de Actividad**: 100+ eventos rastreados
- **Versión de la API**: v3.0 con PostgreSQL

## 🚢 Despliegue

### Infraestructura de Producción
- **VPS Ubuntu 22.04** - Servidor dedicado de alto rendimiento
- **Nginx** - Proxy reverso con SSL automático
- **PostgreSQL** - Base de datos principal
- **PM2** - Gestión de procesos Node.js
- **Docker** - Containerización de aplicaciones
- **Let's Encrypt** - Certificados SSL automáticos

### Características de Producción
- **SSL/TLS** - Certificados automáticos para todos los dominios
- **Subdominios Wildcard** - `*.xistracloud.com` configurado
- **Backups Automáticos** - Respaldos programados diarios
- **Monitoreo 24/7** - Métricas en tiempo real
- **Escalabilidad** - Preparado para crecimiento empresarial

## 🔧 Funcionalidades Avanzadas

### Webhooks de GitHub
- Despliegues automáticos en push a main
- Despliegues de preview en pull requests
- Verificación de firmas de seguridad
- Gestión de ramas y commits

### Sistema de Equipos
- Roles y permisos granulares
- Invitaciones por email
- Gestión de acceso por proyecto
- Auditoría de actividades

### Variables de Entorno
- Gestión por proyecto
- Variables secretas enmascaradas
- Validación de formato
- Historial de cambios


## DIAGRAMA

<div align="left">
  <img src="https://github.com/user-attachments/assets/2c9dbff5-ec31-48ea-8dec-7ed0b5eae067" width="65%" alt="Diagrama">
</div>

## 🤝 Contribuciones

¡Damos la bienvenida a las contribuciones! Por favor, consulta nuestras pautas de contribución:

1. Haz fork del repositorio
2. Crea una rama de característica: `git checkout -b feature/caracteristica-increible`
3. Confirma los cambios: `git commit -m 'Agregar característica increíble'`
4. Sube a la rama: `git push origin feature/caracteristica-increible`
5. Abre un pull request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Yago Mateos**
- GitHub: [@yagomateos](https://github.com/yagomateos)
- Proyecto: [XistraCloud](https://github.com/yagomateos/XistraCloud)
- Demo: [xistracloud.com](https://xistracloud.com)

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) por la hermosa librería de componentes
- [Docker](https://docker.com) por la containerización
- [PostgreSQL](https://postgresql.org) por la base de datos robusta
- [Nginx](https://nginx.org) por el servidor web de alto rendimiento
- [Let's Encrypt](https://letsencrypt.org) por los certificados SSL gratuitos

---

<div align="center">
  <strong>Construido con ❤️ usando tecnologías web modernas en React y Typescript</strong>
  <br>
  <sub>XistraCloud - El futuro del despliegue en la nube</sub>
</div>
