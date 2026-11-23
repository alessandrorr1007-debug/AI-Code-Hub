# Contrato UI: 9 secciones y asistente a la derecha

**Aplicación personal**, orientada al trabajo local en Windows. Conservar el mismo marco en cada vista, sin Inicio ni sección Chat IA.

## Estructura invariable
- Izquierda: navegación fija con exactamente 9 apartados: **Proyectos**, **Estudio Creativo**, **Memoria**, **Mapa**, **Diagnóstico**, **Versiones**, **Instaladores**, **Automatizaciones** y **Ajustes**.
- Centro: contenido específico de la sección. Pantalla inicial: **Proyectos**. Al seleccionar un proyecto aparece una banda «Proyecto activo», acceso al asistente y botón de contexto.
- Derecha: panel **Asistente IA** persistente y ocultable, pestañas **IA** y **Contexto**, conservadas al navegar entre secciones.
- Barra superior: selector de proyecto, búsqueda, botón **Asistente IA**, control para ocultar/mostrar panel y Ajustes. No duplicar selector de agente en la barra.
- El panel lateral puede ocultarse y en resoluciones pequeñas se muestra superpuesto, accesible mediante el botón superior. No debe impedir la navegación izquierda.

## Panel Asistente IA
### Pestaña IA
- Selector: Codex / Gemini / OpenCode.
- Indicar siempre **Conexión pendiente** mientras no haya integración oficial.
- Mostrar instrucciones guardadas **solo del proyecto seleccionado**.
- Redactar una instrucción y **Guardar nota** sin enviarla a un modelo.
- Acción **Copiar contexto**, sin llamadas remotas ni consumo de tokens.
- Sin proyecto seleccionado, mostrar acceso a Proyectos.

### Pestaña Contexto
- Resumen de recuerdos, tareas y archivos locales.
- Modos económico, equilibrado y profundo; preservar reglas críticas.
- Vista previa en texto y botón **Copiar contexto**.
- Las cifras son **estimaciones**, nunca cuotas reales de proveedores.
- Acceso a Memoria para administrar reglas, notas y pendientes.

## Diseño visual
- Fondo oscuro `#090d19` y superficies `#121a2d` / `#172039`.
- Acentos `#7854f8` y `#5168ff`; colores de estado solo cuando sean verificables.
- Sidebar 244px aprox., barra superior 65px, panel asistente 365px en pantallas amplias.
- Interfaces compactas, sin animaciones continuas, sin modelos locales pesados ni terminal visible.
- El aspecto exacto se comprobará visualmente cuando la app se ejecute en Windows; imágenes generadas son conceptuales.

## Principio funcional
No mostrar como conectadas las IA ni operaciones como instalar APK, ejecutar automatizaciones o restaurar Git mientras sus servicios no existan. No modificar archivos del proyecto sin autorización. Nunca subir datos SQLite ni credenciales a GitHub.
