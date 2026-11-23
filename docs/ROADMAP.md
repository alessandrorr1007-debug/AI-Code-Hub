# AI Code Hub · Hoja de ruta

## Fase 1 — base funcional (actual)
- Tauri 2, React, TypeScript, Vite.
- Navegación consistente de 9 vistas con Proyectos como inicio y asistente IA/Contexto a la derecha.
- Importación local de carpetas mediante diálogo nativo y detección no destructiva de tipo.
- Resúmenes, tareas, referencias, notas y conversaciones locales (sin respuestas falsas de IA).
- Selector visual de Codex / Gemini / OpenCode desde el panel derecho; conexiones todavía pendientes.
- Modo ligero (sin animaciones continuas), código opcional, sin terminal visible.
- Instaladores filtra Android; instalación real pendiente de SDK/ADB y permisos.

## Fase 2 — persistencia y lectura contextual
- SQLite local incorporado en rama de desarrollo, pendiente de pruebas nativas de Windows.
- Indexación selectiva de archivos y diferencias Git; límites de contexto.
- Revisión de cambios, reglas protegidas y recuperación de estado.

## Fase 3 — agentes oficiales
- Adaptadores Codex, Gemini/Antigravity y OpenCode según compatibilidad y términos.
- Autenticación de cada proveedor por vías oficiales, nunca captura de credenciales.
- Traspaso resumido de contexto con verificación del estado real.
- Indicadores honestos de cuota cuando el proveedor lo permita.

## Fase 4 — herramientas locales
- Instalación/actualización Android con ADB, comprobación de paquete y firma.
- Compilaciones con logs visibles (no terminal), bloqueo de operaciones peligrosas.
- Diagnósticos y herramientas visuales por tipo de proyecto.
- Estudio Creativo: análisis de enlaces/capturas y guías visuales con consentimiento.

## Objetivos transversales
- Windows 10/11, uso mínimo de CPU/GPU en reposo y arranque rápido.
- La actividad de IA se ejecuta solo bajo demanda; ningún modelo local pesado es obligatorio.
- Ningún simulacro se presentará como integración activa.
- No versionar datos personales, sesiones, API keys ni bases de datos.
