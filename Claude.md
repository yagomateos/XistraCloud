# Reglas de desarrollo con Claude en este proyecto

## Instrucciones generales
- No preguntes "¿quieres que implemente?" → aplica los cambios directamente.
- No modifiques archivos que ya están bien y no presentan errores.
- Haz cambios mínimos, puntuales y enfocados en resolver el error mostrado.
- Explica los errores con claridad, pero evita dar teoría innecesaria.
- No reestructures todo el proyecto salvo que yo lo pida explícitamente.
- Si el error es de rutas, imports o archivos faltantes → corrige solo lo necesario para que funcione.
- No inventes archivos que no existen a menos que el error claramente lo requiera (ej: `app-deployment.ts`).
- Si falta un archivo, créalo con lo mínimo indispensable para que compile y funcione.

## Estilo de código
- Usa TypeScript estricto y tipado claro.
- Mantén la consistencia con los componentes existentes (Card, Input, Button, etc.).
- Usa imports absolutos (`@/…`) solo si ya están configurados en tsconfig.json; si no, usa relativos.
- Evita código duplicado: si ya hay un hook, función o util que hace lo mismo, reutilízalo.

## Manejo de errores
- Si el error es por `undefined` en un `.map`, comprueba que el array existe antes de mapearlo.
- Si el error es por un `ENOENT` (archivo no encontrado), indica la ruta correcta o crea el archivo mínimo.
- Si el error es de Supabase, usa siempre `select=` en lugar de `columns=`.
- Si el error es de puerto o URL incorrecta, ajusta el backend/frontend sin hardcodear valores.

## Optimización de respuestas
- No hagas pasos excesivos ni "voy a investigar X" → pasa directamente al fix.
- Prioriza soluciones cortas que consuman menos tokens.
- No uses descripciones largas si con 2-3 frases y el código es suficiente.

## Flujo de trabajo
- Cuando detectes un error, indícalo con un comentario en el código al arreglarlo.
- Antes de añadir lógica nueva, valida si ya hay algo implementado en el proyecto.
- No cambies estilos ni UI a menos que sea parte del bug reportado.
