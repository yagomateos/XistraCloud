# Configuración de URLs en Supabase

## 📧 URLs de Confirmación de Email

Para que los usuarios sean redirigidos correctamente después de confirmar su email, necesitas configurar estas URLs en tu panel de Supabase:

### 1. **Ir a Supabase Dashboard**
- Ve a https://supabase.com/dashboard
- Selecciona tu proyecto: **metzjfocvkelucinstul**

### 2. **Configurar Authentication URLs**
Ve a: `Authentication` → `URL Configuration`

### 3. **Agregar Site URL**
```
Site URL: https://xistracloud-f4ui2wq4e-yagomateos-projects.vercel.app
```

### 4. **Configurar Redirect URLs**
Agregar en "Redirect URLs":
```
https://xistracloud-f4ui2wq4e-yagomateos-projects.vercel.app/email-confirmed
https://xistracloud-f4ui2wq4e-yagomateos-projects.vercel.app/dashboard
https://xistracloud-f4ui2wq4e-yagomateos-projects.vercel.app/**
```

### 5. **Email Templates (Opcional)**
Si quieres personalizar el email de confirmación, ve a:
`Authentication` → `Email Templates` → `Confirm signup`

Cambia la URL de confirmación a:
```
{{ .SiteURL }}/email-confirmed?token={{ .Token }}&type=signup&redirect_to={{ .RedirectTo }}
```

## 🔄 Resultado

Después de esta configuración:
1. ✅ Usuario se registra
2. ✅ Recibe email de confirmación  
3. ✅ Hace clic en el enlace
4. ✅ Es redirigido a `/email-confirmed`
5. ✅ Ve mensaje de "Email confirmado exitosamente"
6. ✅ Es redirigido automáticamente al Dashboard

## 🚨 Importante

- Reemplaza las URLs con tu dominio final cuando tengas un dominio personalizado
- Para desarrollo local, también agregar: `http://localhost:8080/email-confirmed`
