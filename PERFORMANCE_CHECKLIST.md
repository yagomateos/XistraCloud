### Checklist de Rendimiento (XistraCloud)

Backend
- [ ] Evitar n+1 en lecturas de `req.userData` (cache en memoria por request)
- [ ] Usar `fsp` (promises) consistentemente y evitar sync bloqueante en rutas críticas
- [ ] Reducir logs verbosos en producción (niveles y sampling)
- [ ] Reutilizar transport de email en env de dev (no recrear por petición)
- [ ] Streaming/`res.download` eficiente para backups grandes
- [ ] Paginar `logs`, `deployments`, `projects` (limit+offset)
- [ ] Debounce en tareas programadas (backups) para evitar duplicados

Frontend
- [ ] `react-query` caching y staleTime adecuado en listas
- [ ] Evitar polling innecesario (solo cuando status=in_progress)
- [ ] Memoización en tablas/listas largas
- [ ] Carga diferida (code-splitting) de páginas pesadas
- [ ] Suspense para estados de carga y placeholders ligeros

Infra/otros
- [ ] Comprimir respuestas (gzip/br) en prod (reverse proxy)
- [ ] CDN para estáticos (avatars/uploads si aplica)
- [ ] Auditoría Lighthouse para bundle y TTI

Notas
- Priorizaremos paginación y reducción de logs para impacto inmediato.
