# Configuración de URLs en Supabase

## 📧 URLs de Confirmación de Email

Para que los usuarios sean redirigidos correctamente después de confirmar su email, necesitas configurar estas URLs en tu panel de Supabase:

### 1. **Ir a Supabase Dashboard**
- Ve a https://supabase.com/dashboard/project/metzjfocvkelucinstul/auth/url-configuration
- O usa el enlace directo que abrimos arriba

### 2. **Configurar Site URL**
```
https://xistracloud.com
```

### 3. **Configurar Redirect URLs**
Agregar estas líneas en "Redirect URLs" (una por línea):
```
https://xistracloud.com/email-confirmed
https://xistracloud.com/dashboard  
https://xistracloud.com/login
https://xistracloud.com/**
http://localhost:3000/redirect.html
```

### 4. **Configurar Email Templates**
En `Authentication` → `Email Templates` → `Confirm signup`, cambiar la URL de confirmación a:
```
{{ .SiteURL }}/email-confirmed#access_token={{ .Token }}&type=signup&redirect_to={{ .RedirectTo }}
```

## 🔄 **Solución Temporal**

Mientras configuras las URLs en Supabase, hemos creado:

### `redirect.html` 
- Página que maneja automáticamente las redirecciones desde localhost:3000
- Captura los parámetros de confirmación
- Redirige automáticamente a producción con los tokens

### `EmailConfirmed.tsx` mejorado
- Maneja parámetros tanto de query string como de hash
- Mejor logging para debugging
- Limpia la URL después de procesar los tokens

## 🚀 **Resultado**

Después de esta configuración:
1. ✅ Usuario se registra
2. ✅ Recibe email de confirmación  
3. ✅ Hace clic en el enlace
4. ✅ Es redirigido a la URL correcta (production)
5. ✅ Ve mensaje de "Email confirmado exitosamente"
6. ✅ Es redirigido automáticamente al Dashboard

## 🚨 **ACCIÓN REQUERIDA**

**DEBES configurar las URLs en Supabase AHORA:**
1. Ve a: https://supabase.com/dashboard/project/metzjfocvkelucinstul/auth/url-configuration
2. Cambiar Site URL a: `https://xistracloud.com`
3. Agregar las Redirect URLs listadas arriba
