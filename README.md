# AI Code Hub

**Aplicación de escritorio para Windows, ligera y orientada al desarrollo asistido por IA.** Proyecto creado con **Tauri 2 + React + TypeScript + Rust**.

## Fase 1 · Lo que ya funciona

- **Proyectos es la pantalla inicial**. Menú izquierdo con 9 apartados: Proyectos, Estudio Creativo, Memoria, Mapa, Diagnóstico, Versiones, Instaladores, Automatizaciones y Ajustes.
- **Asistente IA lateral derecho**, ocultable y disponible desde las 9 secciones; dos pestañas IA / Contexto.
- Codex, Gemini y OpenCode se seleccionan dentro del panel IA; los mensajes se guardan como instrucciones locales y las conexiones reales siguen pendientes.
- **Abrir carpetas locales** mediante el diálogo nativo de Windows y detectar de forma no destructiva Android/Gradle, web, Tauri y Python.
- Mostrar un mapa inicial de carpetas y archivos, y un diagnóstico estructural básico (sin ejecutar scripts).
- Guardar **notas de trabajo**, reglas, decisiones, tareas y enlaces/capturas de referencia por proyecto.
- SQLite local en Windows con migración inicial de datos de la WebView y respaldo JSON.
- Preparar y copiar un resumen de contexto por proyecto (económico, equilibrado o profundo), sin realizar solicitudes a proveedores.
- Gestionar el perfil de rendimiento: **Económico** o **Equilibrado**.
- Exportar un respaldo local del estado del Hub en JSON.
- Filtrar los proyectos Android dentro de **Instaladores**. Los proyectos web no aparecen ahí.
- Seleccionar visualmente Codex, Gemini u OpenCode **sin simular que ya están conectados**.

## Lo que no está integrado todavía

- Autenticación y ejecución de Codex, Gemini/Antigravity y OpenCode.
- Traspaso automático de contexto entre agentes y medición real de tokens del proveedor (el generador local ofrece aproximaciones).
- Indexación inteligente del contenido del código, búsqueda semántica y deduplicación avanzada (SQLite actualmente guarda un estado JSON versionado).
- Compilación de proyectos, comandos ADB, instalación/actualización APK en teléfonos.
- Ejecución programada de automatizaciones, Git commits, restauraciones y pruebas reales.
- Análisis automatizado de imágenes, sitios web o publicaciones de Instagram.
- Visor/editor de código completo y previsualización en vivo.

**No hay terminal visible en la interfaz.** Las herramientas nativas se incorporarán por fases con aprobaciones y permisos.

## Cómo ejecutar en Windows

### Requisitos

- Windows 10/11 con **WebView2**.
- Node.js 22 y npm.
- Rust y Cargo con toolchain MSVC de Windows.
- Herramientas de compilación Microsoft C++ requeridas por Tauri.

### Desarrollo

```powershell
git clone https://github.com/alessandrorr1007-debug/AI-Code-Hub.git
cd AI-Code-Hub
npm install
npm run tauri dev
```

**Vista web de componentes** (sin acceso nativo a carpetas de Windows):

```powershell
npm run dev
```

### Validación del frontend

```powershell
npm run check
npm run build
```

### Compilar instalador .exe

```powershell
npm run tauri build
```

Configurado para generar un instalador Windows NSIS. También existe un flujo manual en **Actions → Build Windows installer → Run workflow**. El instalador aún debe comprobarse en un runner Windows.

## Arquitectura

```text
src/
  App.tsx             # Shell, navegación y coordinación de estado
  sections.tsx        # 9 vistas con acciones locales reales o límites explícitos
  AssistantPanel.tsx  # Panel derecho permanente: IA y Contexto
  styles.css          # Diseño compartido compacto / modo ligero
  types.ts            # Contratos y tipado
  storage.ts          # SQLite en Tauri, migración y respaldo WebView
  desktop.ts          # Adaptadores de diálogo Tauri
  context.ts          # Preparador local de contexto selectivo
src-tauri/
  src/projects.rs     # Inspección de carpetas (solo lectura)
  src/lib.rs          # Registro de comandos y plugin oficial de diálogos
  src/state.rs        # Lectura y guardado de memoria SQLite
  capabilities/       # Permisos mínimos
  icons/              # Iconos Windows
docs/
  ROADMAP.md          # Plan incremental
  UI_SPEC.md          # Contrato de las 9 vistas + panel derecho
.github/workflows/
  frontend.yml        # TypeScript y build del frontend
  windows-installer.yml # Build de Windows manual
```

## Seguridad y rendimiento

- No subir `.env`, credenciales, tokens, sesiones ni bases de datos a Git.
- Las rutas locales se registran solo después de la selección del usuario.
- La inspección excluye `.git`, `node_modules`, carpetas de compilación y virtualenvs; el escaneo está limitado en profundidad y cantidad.
- No se inician agentes, modelos ni indexaciones pesadas mientras no sean necesarios.
- Exporta copias si trabajas con información importante: SQLite está implementado en Windows, pero todavía no tiene una estrategia de respaldo automático completo.

Consulta [docs/ROADMAP.md](docs/ROADMAP.md) para las próximas etapas.

## Modo de memoria eficiente (en desarrollo)

En **Memoria** puedes registrar decisiones, reglas críticas y tareas. La herramienta **Preparar contexto** selecciona recuerdos, tareas y rutas de archivos relevantes y permite copiar el resumen al portapapeles. Los modos económico, equilibrado y profundo limitan el número de elementos adicionales, pero **nunca excluyen reglas críticas**. Esta función no envía prompts a Codex, Gemini u OpenCode y sus estimaciones de tokens no representan cuotas reales.

La base de escritorio utiliza SQLite dentro del directorio privado de datos de Tauri. La primera vez se importa el antiguo estado local de la WebView si la base todavía no existe. La vista web mantiene su almacenamiento local de desarrollo.

Pruebas locales del algoritmo: `npm test`. **No se necesitan GitHub Actions.**

## Distribución personal del escritorio

El acceso al Hub comienza en **Proyectos**, sin pantalla Inicio. **Chat IA no tiene una ruta independiente**: se abre desde el botón superior «Asistente IA» o desde la tarjeta de proyecto activo. La zona derecha mantiene dos pestañas: **IA** (instrucciones y selección de agente) y **Contexto** (recuerdos, pendientes, rutas y resumen copiable). Todo es local y los asistentes aún no responden: ninguna nota se envía a la red. En pantallas pequeñas el asistente se abre como panel superpuesto.
