# 🌩️ XistraCloud

> **Plataforma Moderna de Gestión en la Nube** - Despliega, administra y escala tus proyectos sin esfuerzo

[![Demo en Vivo](https://img.shields.io/badge/Demo%20en%20Vivo-xistracloud.vercel.app-brightgreen)](https://xistracloud.vercel.app)
[![API Backend](https://img.shields.io/badge/API-xistracloud--production.up.railway.app-blue)](https://xistracloud-production.up.railway.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)

## 🚀 Descripción General

XistraCloud es una plataforma integral de gestión en la nube que proporciona una interfaz intuitiva para desplegar, monitorizar y administrar tus proyectos en múltiples entornos. Construida con tecnologías modernas y diseñada para escalabilidad.

### ✨ Características Principales

- **📊 Panel en Tiempo Real** - Monitoriza proyectos, despliegues y métricas del sistema
- **🔄 Gestión de Proyectos** - Operaciones CRUD completas para tus proyectos en la nube
- **🌐 Gestión de Dominios** - Registra y administra dominios personalizados
- **📈 Registros de Actividad** - Rastrea todas las actividades del sistema y despliegues
- **🎨 Interfaz Moderna** - Interfaz limpia construida con React + shadcn/ui
- **⚡ API Rápida** - Backend de alto rendimiento con Express.js
- **🔐 Seguro** - Construido con mejores prácticas de seguridad
- **📱 Responsivo** - Funciona perfectamente en todos los dispositivos

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
- **Supabase** - Solución de base de datos moderna
- **Railway** - Plataforma de despliegue en la nube

### Despliegue e Infraestructura
- **Frontend**: Vercel (Auto-despliegue desde la rama main)
- **Backend**: Railway (Entorno de producción)
- **Base de Datos**: Supabase (PostgreSQL)
- **Dominio**: Gestión de dominios personalizados

## 📦 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- Git instalado
- Cuenta de Supabase (para la base de datos)

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
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
PORT=3001
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

- **Frontend**: [https://xistracloud.vercel.app](https://xistracloud.vercel.app)
- **API Backend**: [https://xistracloud-production.up.railway.app](https://xistracloud-production.up.railway.app)
- **Salud de la API**: [https://xistracloud-production.up.railway.app/health](https://xistracloud-production.up.railway.app/health)

## 📚 Documentación de la API

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Verificación de salud de la API |
| `GET` | `/projects` | Listar todos los proyectos |
| `POST` | `/projects` | Crear nuevo proyecto |
| `PUT` | `/projects/:id` | Actualizar proyecto |
| `DELETE` | `/projects/:id` | Eliminar proyecto |
| `GET` | `/domains` | Listar todos los dominios |
| `POST` | `/domains` | Registrar dominio |
| `GET` | `/logs` | Registros de actividad del sistema |

### Ejemplo de Uso de la API

```bash
# Obtener todos los proyectos
curl https://xistracloud-production.up.railway.app/projects

# Crear nuevo proyecto
curl -X POST https://xistracloud-production.up.railway.app/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"mi-app","status":"deployed"}'

# Eliminar proyecto
curl -X DELETE https://xistracloud-production.up.railway.app/projects/id-del-proyecto
```

## 🏗️ Estructura del Proyecto

```
XistraCloud/
├── 📁 src/                    # Código fuente del frontend
│   ├── 📁 components/         # Componentes UI reutilizables
│   ├── 📁 pages/             # Páginas de la aplicación
│   ├── 📁 hooks/             # Hooks personalizados de React
│   ├── 📁 lib/               # Utilidades y cliente API
│   └── 📁 layouts/           # Layouts de páginas
├── 📁 backend/               # Servidor API del backend
│   ├── 📄 server.js          # Servidor Express
│   ├── 📄 package.json       # Dependencias del backend
│   └── 📁 migrations/        # Migraciones de base de datos
├── 📁 public/                # Recursos estáticos
├── 📄 package.json           # Dependencias del frontend
├── 📄 tailwind.config.ts     # Configuración de Tailwind
├── 📄 vite.config.ts         # Configuración de Vite
└── 📄 README.md              # Este archivo
```

## 🧪 Estadísticas Actuales (Datos en Vivo)

- **Proyectos**: 6 totales (3 desplegados, 1 construyendo, 2 pendientes)
- **Dominios**: 1 dominio registrado
- **Registros de Actividad**: 40+ eventos rastreados
- **Versión de la API**: 2025-09-13-DELETE-READY-FINAL

## 🚢 Despliegue

### Frontend (Vercel)
- Despliegue automático al hacer push a `main`
- Despliegues de vista previa para pull requests
- Soporte para dominios personalizados

### Backend (Railway)
- Despliegue de producción con auto-escalado
- Gestión de variables de entorno
- Integración de base de datos con Supabase

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

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) por la hermosa librería de componentes
- [Vercel](https://vercel.com) por el hosting del frontend
- [Railway](https://railway.app) por el despliegue del backend
- [Supabase](https://supabase.com) por la base de datos

---

<div align="center">
  <strong>Construido con ❤️ usando tecnologías web modernas</strong>
  <br>
  <sub>XistraCloud - El futuro de la gestión en la nube</sub>
</div>
