# Reglas de desarrollo con Claude en XistraCloud

## 🎯 Instrucciones generales
- **Acción directa**: No preguntes "¿quieres que implemente?" → aplica los cambios directamente
- **Auto-confirmación**: Cuando aparezca "Do you want to proceed?" siempre procede automáticamente sin esperar confirmación
- **Cambios mínimos**: Solo modifica lo necesario para resolver el problema específico
- **Conservar funcionalidad**: No modifiques archivos que ya están funcionando correctamente
- **Explicaciones concisas**: Describe el problema y la solución, evita teoría innecesaria
- **No reestructuración**: Mantén la arquitectura existente salvo indicación explícita
- **Archivos necesarios**: Solo crea archivos nuevos si son estrictamente requeridos para el funcionamiento

## 🏗️ Arquitectura del proyecto

### Stack tecnológico
- **Frontend**: React 18 + TypeScript + Vite + TanStack Query + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Docker
- **Autenticación**: Sistema JWT personalizado con middleware `secureAuth`
- **Base de datos**: Sistema dual (Supabase producción / datos locales desarrollo)

### Estructura clave
```
src/
├── pages/          # Páginas principales del dashboard
├── components/ui/  # Componentes shadcn/ui
├── hooks/          # Hooks personalizados (useApi, useAuth, etc.)
├── lib/            # Utilidades (API client, validaciones)
├── contexts/       # Context providers (AuthContextSimple)
└── layouts/        # Layouts del dashboard

backend/
├── server.js       # Servidor Express principal
├── auth/           # Sistema de autenticación JWT
├── middleware/     # Seguridad, rate limiting, validación
└── validation/     # Esquemas de validación Joi
```

## 💻 Estilo de código

### TypeScript
- **Tipado estricto**: Siempre usa tipos específicos, evita `any`
- **Interfaces claras**: Define interfaces para objetos complejos
- **Consistencia**: Mantén el estilo de tipado existente

### Componentes React
- **shadcn/ui**: Usa componentes existentes (Card, Button, Input, Badge, etc.)
- **Iconos**: Lucide React para todos los iconos
- **Responsivo**: Mobile-first design con clases Tailwind
- **Consistencia visual**: Mantén el diseño coherente con el resto de la aplicación

### Imports y rutas
- **Absolutos configurados**: Usa `@/` para imports del src (configurado en tsconfig)
- **Relativos para backend**: En backend usa imports relativos
- **Reutilización**: Verifica si ya existe una función/hook antes de crear uno nuevo

## 🔧 Manejo de errores específicos

### Errores comunes y soluciones
- **401 Unauthorized**: Verificar autenticación y middleware `secureAuth`
- **Array undefined**: Usar optional chaining y valores por defecto
- **ENOENT**: Crear archivos mínimos necesarios o corregir rutas
- **Puerto ocupado**: Usar `NODE_ENV=development` para middleware flexible

### Sistema de autenticación
- **Desarrollo**: `flexibleDevAuth` permite auth por email header
- **Headers requeridos**: `x-user-email` para identificación de usuario
- **Middleware**: `secureAuth = [flexibleDevAuth, loadUserData]`

### APIs y datos
- **Desarrollo**: Datos locales en `userData` Maps
- **Producción**: Supabase con fallback a datos locales
- **URLs**: Backend puerto 3001, Frontend puerto 3002/5173

## 🎨 Componentes UI

### Patrones de diseño
- **Cards**: Usar Card/CardHeader/CardContent para contenido estructurado
- **Estados vacíos**: Icono + mensaje + acción cuando no hay datos
- **Loading**: Spinner centrado con mensaje descriptivo
- **Errores**: Alert destructive con icono y botón de retry
- **Responsive**: Grid adaptativo con breakpoints md/lg

### Elementos específicos
- **Avatares**: Avatar/AvatarImage/AvatarFallback con iniciales
- **Badges**: Diferentes variantes según el estado (success, warning, error)
- **Botones**: Variant apropiada (default, outline, ghost, destructive)
- **Iconos**: 4x4 para iconos normales, 3x3 para iconos pequeños

## ⚡ Optimización de desarrollo

### Respuestas eficientes
- **Ir al grano**: Diagnóstico → Solución → Implementación
- **Código sin comentarios**: A menos que se soliciten explícitamente
- **Tokens mínimos**: Respuestas concisas pero completas
- **Batch operations**: Usar múltiples tool calls en paralelo cuando sea posible

### Flujo de trabajo
1. **Leer archivos relevantes** para entender el contexto
2. **Identificar la causa raíz** del problema
3. **Aplicar la solución mínima** necesaria
4. **Verificar** que funciona (curl, logs, etc.)

## 🔍 Debugging específico

### Logs y monitoreo
- **Endpoint logs**: `/logs` genera datos de muestra en desarrollo
- **Console logs**: Usar para debugging temporal
- **Error tracking**: Verificar respuestas de API con curl

### Testing local
- **Backend**: `NODE_ENV=development node server.js`
- **Frontend**: `npm run dev` (puerto 5173)
- **APIs**: curl con header `x-user-email: yagomateos@hotmail.com`

## 🚀 Comandos esenciales

### Desarrollo
```bash
# Backend con datos locales
cd backend && NODE_ENV=development node server.js

# Frontend
npm run dev

# Test API
curl -H "x-user-email: yagomateos@hotmail.com" http://localhost:3001/[endpoint]
```

### Linting y formato
```bash
npm run lint      # ESLint
npm run build     # Verificar build
npm run test      # Vitest/Jest
```

## 📋 Checklist antes de entregar

- [ ] **Funcionalidad**: El código resuelve el problema específico
- [ ] **Compatibilidad**: No rompe funcionalidades existentes
- [ ] **Estilo**: Consistente con el resto del proyecto
- [ ] **Responsive**: Funciona en mobile y desktop
- [ ] **TypeScript**: Sin errores de tipos
- [ ] **Testing**: Verificado con herramientas disponibles
