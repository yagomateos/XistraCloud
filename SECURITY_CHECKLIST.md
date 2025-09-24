### Checklist de Seguridad (XistraCloud)

- [x] Autenticación JWT con expiración y verificación (`backend/auth/jwt-auth.js`)
- [x] Hash de contraseñas con bcrypt
- [x] Rate limiting en rutas de auth y API (`backend/middleware/security.js`)
- [x] Helmet con cabeceras de seguridad
- [x] CORS seguro (modo dev relajado)
- [x] Validación con Joi en endpoints críticos (`backend/validation/schemas.js`)
- [x] Sanitización XSS en inputs
- [x] Aislamiento de datos por usuario (`req.userData`)
- [x] `.gitignore` con envs; secretos fuera del repo
- [x] Subida de ficheros (avatar) con `multer` y ruta estática segura
- [x] Logs de seguridad básicos (intentos fallidos / 401 / 429)
- [ ] Revisar rotación de tokens y refresh lifecycle
- [ ] Revisar política de CORS para producción (orígenes permitidos)
- [ ] Revisar CSP avanzada (Content-Security-Policy) si aplica a frontend
- [ ] Revisar almacenamiento seguro de JWT en frontend (httponly cookies vs localStorage)
- [ ] Revisar protección CSRF si se usan cookies
- [ ] Auditoría de dependencias (npm audit) y actualización

Notas:
- En desarrollo, el rate limit se ha relajado para no bloquear pruebas.
- En producción, endurecer ventanas y límites.
