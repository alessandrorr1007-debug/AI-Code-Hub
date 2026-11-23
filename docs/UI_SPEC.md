# Contrato de diseño: 11 vistas coherentes

**Regla principal:** el menú izquierdo, la barra superior, la selección de proyecto, la paleta y las proporciones nunca cambian al navegar. Solo cambia el área central y el contenido del inspector derecho opcional.

## Diseño visual
- Fondo: azul marino/negro (por ejemplo `#090d19`).
- Superficies: `#121a2d` y `#172039`.
- Acentos: morado `#7854f8` y azul `#5168ff`; estados verdes solo cuando se verifican.
- Contenido compacto y legible, sin sombras/animaciones costosas.
- Sin terminal en pantalla; código opcional, no protagonista.
- Tipografía del sistema, sin descargar fuentes externas.
- Sidebar 244px aprox., header 65px, inspector 315px si hay espacio; inspector ocultable y colapsable en laptop pequeña.

## Secciones
| Vista | Contenido central | Panel contextual |
|---|---|---|
| Inicio | Continuar proyecto, métricas locales, recientes, accesos rápidos | Estado y actividad |
| Proyectos | Abrir carpeta, proyectos reales, filtros, clasificación | Proyecto seleccionado |
| Chat IA | Selector Codex/Gemini/OpenCode, instrucciones guardadas | Estado de agente y contexto |
| Estudio Creativo | Guardar enlaces y capturas, futura extracción visual | Etapas del análisis |
| Memoria | Decisiones, reglas, contexto, tareas, exportación | Ahorro de contexto y privacidad |
| Mapa | Carpetas y archivos reales, módulos para próxima fase | Tipo y tecnología detectados |
| Diagnóstico | Verificaciones no destructivas, resultados comprobables | Estado y recomendaciones |
| Versiones | Eventos locales, futura comparación Git | Seguridad y restauración |
| Instaladores | Solo proyectos Android; futuro instalar/actualizar | Compatibilidad de dispositivo |
| Automatizaciones | Flujos en borrador | Estado del motor local |
| Ajustes | Rendimiento, apariencia, exportar datos | Información del programa |

## Implementación progresiva
Primero funcionamiento local verificable; luego persistencia robusta, conexiones oficiales de IA, análisis multimodal y ADB. Nunca mostrar métricas inventadas, conexiones simuladas como activas ni botones que indiquen acciones que no realizan.

Las capturas visuales de planificación compartidas en conversación son la guía de estilo; no se incluyen como archivos binarios en este primer commit.
