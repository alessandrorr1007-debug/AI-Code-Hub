# AI Code Hub

**Aplicación de escritorio para Windows, ligera y orientada al desarrollo asistido por IA.** Proyecto creado con **Tauri 2 + React + TypeScript + Rust**.

## Fase 1 · Lo que ya funciona

- Navegación en **11 secciones** con estructura fija: Inicio, Proyectos, Chat IA, Estudio Creativo, Memoria, Mapa, Diagnóstico, Versiones, Instaladores, Automatizaciones y Ajustes.
- **Abrir carpetas locales** mediante el diálogo nativo de Windows y detectar de forma no destructiva Android/Gradle, web, Tauri y Python.
- Mostrar un mapa inicial de carpetas y archivos, y un diagnóstico estructural básico (sin ejecutar scripts).
- Guardar **notas de trabajo**, reglas, decisiones, tareas y enlaces/capturas de referencia por proyecto.
- Gestionar el perfil de rendimiento: **Económico** o **Equilibrado**.
- Exportar un respaldo local del estado del Hub en JSON.
- Filtrar los proyectos Android dentro de **Instaladores**. Los proyectos web no aparecen ahí.
- Seleccionar visualmente Codex, Gemini u OpenCode **sin simular que ya están conectados**.

## Lo que no está integrado todavía

- Autenticación y ejecución de Codex, Gemini/Antigravity y OpenCode.
- Traspaso de contexto real entre agentes, resumen automático y medición de tokens.
- SQLite: la Fase 1 utiliza almacenamiento local de la WebView para registros de interfaz; no incluye secretos.
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
  sections.tsx        # 11 vistas con acciones locales reales o límites explícitos
  styles.css          # Diseño compartido compacto / modo ligero
  types.ts            # Contratos y tipado
  storage.ts          # Persistencia local versionada de Fase 1
  desktop.ts          # Adaptadores de diálogo Tauri
src-tauri/
  src/projects.rs     # Inspección de carpetas (solo lectura)
  src/lib.rs          # Registro de comandos y plugin oficial de diálogos
  capabilities/       # Permisos mínimos
  icons/              # Iconos Windows
docs/
  ROADMAP.md          # Plan incremental
  UI_SPEC.md          # Contrato fijo de las 11 vistas
.github/workflows/
  frontend.yml        # TypeScript y build del frontend
  windows-installer.yml # Build de Windows manual
```

## Seguridad y rendimiento

- No subir `.env`, credenciales, tokens, sesiones ni bases de datos a Git.
- Las rutas locales se registran solo después de la selección del usuario.
- La inspección excluye `.git`, `node_modules`, carpetas de compilación y virtualenvs; el escaneo está limitado en profundidad y cantidad.
- No se inician agentes, modelos ni indexaciones pesadas mientras no sean necesarios.
- En esta fase, exporta copias si trabajas con información importante: aún no existe la migración a SQLite.

Consulta [docs/ROADMAP.md](docs/ROADMAP.md) para las próximas etapas.
