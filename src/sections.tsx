import { useState } from "react";
import { prepareContext, type ContextMode } from "./context";
import type { ReactNode } from "react";
import {
  House, FolderOpen, FolderPlus, MessageSquare, Sparkles, Brain, Network,
  Activity, History, Smartphone, Workflow, Settings, Plus, Search, Github,
  CheckCircle2, ChevronRight, Trash2, RefreshCw, Download, Play, Palette,
  Image, Link2, BookOpen, Info, ShieldCheck, Zap, Code2, FileText, Folder,
  CalendarClock, Package, Bug, Laptop, Monitor, Leaf, Clock3, FileCode2,
  ListTodo, GitBranch, ClipboardList, Layers, Copy, Database, AlertCircle,
  LockKeyhole, Save, Send, SlidersHorizontal, CheckSquare, Eye, ExternalLink,
  X, Cpu, SquarePen, ArrowRight, CircleDot, Check, RotateCcw
} from "lucide-react";
import type {
  HubData, Project, Section, Agent, MemoryKind, PerformanceMode
} from "./types";

type IconType = typeof House;
interface Props {
  section: Section;
  data: HubData;
  project: Project | null;
  agent: Agent;
  query: string;
  busy: boolean;
  desktop: boolean;
  openAssistant: (tab?: "ia" | "contexto") => void;
  navigate: (section: Section) => void;
  setAgent: (agent: Agent) => void;
  selectProject: (id: string) => void;
  addProject: () => void;
  refreshProject: (project: Project) => void;
  deleteProject: (project: Project) => void;
  addMemory: (kind: MemoryKind, text: string) => void;
  deleteMemory: (id: string) => void;
  addReference: (value: string, kind: "enlace" | "archivo") => void;
  addReferenceFile: () => void;
  deleteReference: (id: string) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  addMessage: (text: string) => void;
  addAutomation: (text: string) => void;
  changeSettings: (change: Partial<HubData["settings"]>) => void;
  exportData: () => void;
  showNotice: (message: string | null) => void;
}
function Pane({ title, icon: Icon, extra, children, className = "" }: {
  title: string; icon?: IconType; extra?: ReactNode; children: ReactNode; className?: string
}) {
  return <section className={`panel ${className}`}><div className="panel-header"><h3>{Icon && <Icon size={19}/>} {title}</h3>{extra}</div><div className="panel-content">{children}</div></section>;
}
function ViewTitle({ title, subtitle, icon: Icon, actions }: {
  title: string; subtitle: string; icon: IconType; actions?: ReactNode
}) {
  return <div className="view-title"><span className="view-icon"><Icon size={23}/></span><div className="view-heading"><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="view-actions">{actions}</div>}</div>;
}
function Empty({ title, message, button }: { title: string; message: string; button?: ReactNode }) {
  return <div className="empty-state"><FolderOpen size={34}/><strong>{title}</strong><p>{message}</p>{button}</div>;
}
function Stat({ icon: Icon, value, label }: { icon: IconType; value: number | string; label: string }) {
  return <div className="stat"><span className="stat-icon"><Icon size={22}/></span><div><strong>{value}</strong><small>{label}</small></div></div>;
}
function Action({ children, onClick, icon: Icon, secondary = false, disabled = false }: {
  children: ReactNode; onClick?: () => void; icon?: IconType; secondary?: boolean; disabled?: boolean
}) {
  return <button className={secondary ? "btn secondary" : "btn"} onClick={onClick} disabled={disabled}>
    {Icon && <Icon size={16}/>} {children}
  </button>;
}
const at = (value: number) => new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(value);
const kindLabel: Record<Project["kind"], string> = {
  android: "Android / APK", web: "Web", desktop: "Escritorio", python: "Python / IA", unknown: "Sin clasificar"
};
const displayName = (value: string) => value.replace(/\\/g,"/").split("/").pop() || value;

export function WorkspaceView(props: Props) {
  const {
    section, data, project, agent, query, busy, desktop, openAssistant,
    navigate, setAgent, selectProject, addProject, refreshProject, deleteProject,
    addMemory, deleteMemory, addReference, addReferenceFile, deleteReference,
    addTask, toggleTask, addMessage, addAutomation, changeSettings, exportData, showNotice
  } = props;
  const [memoryDraft, setMemoryDraft] = useState("");
  const [memoryType, setMemoryType] = useState<MemoryKind>("decision");
  const [referenceDraft, setReferenceDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [automationDraft, setAutomationDraft] = useState("");
  const [contextMode, setContextMode] = useState<ContextMode>("equilibrado");
  const [contextRequest, setContextRequest] = useState("");
  const [installId, setInstallId] = useState("");
  const selectedId = project?.id || "";
  const memories = data.memories.filter(x => x.projectId === selectedId);
  const references = data.references.filter(x => x.projectId === selectedId);
  const tasks = data.tasks.filter(x => x.projectId === selectedId);
  const messages = data.messages.filter(x => x.projectId === selectedId);
  const activities = data.activities.filter(x => x.projectId === selectedId);
  const allInstallable = data.projects.filter(p => p.kind === "android");
  const installProject = allInstallable.find(p => p.id === installId) || allInstallable.find(p => p.id === selectedId) || allInstallable[0];
  const preparedContext = project ? prepareContext(data, project, contextRequest, contextMode) : null;
  async function copyContext(request: string) {
    if (!project) { showNotice("Primero selecciona un proyecto."); return; }
    const generated = prepareContext(data, project, request, contextMode);
    try {
      await navigator.clipboard.writeText(generated.text);
      showNotice("Contexto local copiado. Puedes pegarlo en tu asistente sin repetir todo el historial.");
    } catch { showNotice("No se pudo copiar automáticamente. Selecciona el texto del panel y cópialo manualmente."); }
  }
  const checkProject = (children: ReactNode) => project ? children : <Empty title="Selecciona un proyecto" message="Abre una carpeta local desde Proyectos para activar esta sección." button={<Action icon={FolderPlus} onClick={addProject}>Abrir carpeta local</Action>}/>;

  let main: ReactNode = null;

  switch (section) {
    case "Proyectos":
      main = <>
        <ViewTitle title="Mis proyectos" subtitle="Abre, inspecciona y organiza carpetas reales de tu computadora." icon={FolderOpen}
          actions={<Action icon={FolderPlus} onClick={addProject} disabled={busy}>Abrir carpeta</Action>}/>
        {project && <div className="project-resume">
          <div className="grow"><span className="eyebrow"><FolderOpen size={14}/> PROYECTO ACTIVO</span>
            <strong>{project.name}</strong>
            <small>{memories.length} recuerdos · {tasks.filter(t=>!t.completed).length} tareas pendientes · {messages.length} instrucciones guardadas</small>
          </div>
          <div className="button-row">
            <Action icon={MessageSquare} onClick={() => openAssistant("ia")}>Abrir asistente</Action>
            <Action icon={Brain} secondary onClick={() => openAssistant("contexto")}>Ver contexto</Action>
          </div>
        </div>
        <div className="filter-strip"><span className="tag">Todos ({data.projects.length})</span><span>Web · Android · Escritorio · IA</span><span className="filter-right">Solo proyectos elegidos por ti</span></div>
        <div className="project-grid">
          {data.projects.filter(p => (p.name + p.framework + p.kind).toLowerCase().includes(query.toLowerCase())).map(p =>
            <article className={`project-card ${p.id === selectedId ? "chosen" : ""}`} key={p.id}>
              <div className="project-heading"><span className="tile-icon"><FolderOpen size={22}/></span><div><h3>{p.name}</h3><small>{kindLabel[p.kind]}</small></div>{p.id === selectedId && <span className="tag success">Activo</span>}</div>
              <p className="path-line" title={p.path}>{p.path}</p>
              <div className="project-meta"><span><FileText size={15}/>{p.fileCount} archivos indexados</span><span><Github size={15}/>{p.hasGit ? "Git detectado" : "Sin Git"}</span></div>
              <div className="button-row"><Action onClick={() => selectProject(p.id)} icon={FolderOpen}>{p.id === selectedId ? "Seleccionado" : "Seleccionar"}</Action><Action secondary icon={RefreshCw} onClick={() => refreshProject(p)}>Revisar</Action><button className="icon-button danger" title="Quitar del Hub (no borra archivos)" onClick={() => deleteProject(p)}><Trash2 size={17}/></button></div>
            </article>
          )}
        </div>
        {!data.projects.length && <Empty title="Tus proyectos aparecerán aquí" message="Selecciona una carpeta existente; AI Code Hub inspecciona su estructura sin modificar sus archivos." button={<Action icon={FolderPlus} onClick={addProject}>Abrir proyecto local</Action>}/>}
        {!!query && !!data.projects.length && !data.projects.some(p => (p.name+p.framework+p.kind).toLowerCase().includes(query.toLowerCase())) && <Empty title="Sin resultados" message="Prueba con otro nombre de proyecto."/>}
      </>;
      break;

    case "Estudio Creativo":
      main = <>
        <ViewTitle title="Estudio Creativo" subtitle="Guarda enlaces y capturas para construir tu biblioteca de inspiración visual." icon={Sparkles}/>
        {checkProject(<>
          <Pane title="Agregar referencias" icon={Link2}>
            <form className="input-row" onSubmit={e => { e.preventDefault(); if (referenceDraft.trim()) { addReference(referenceDraft, "enlace"); setReferenceDraft(""); }}}>
              <input aria-label="Enlace de referencia" value={referenceDraft} onChange={e => setReferenceDraft(e.target.value)} placeholder="https://sitio-web.com o enlace público de Instagram"/>
              <Action icon={Plus} disabled={!referenceDraft.trim()}>Guardar enlace</Action>
            </form>
            <div className="button-row"><Action icon={Image} secondary onClick={addReferenceFile}>Agregar captura</Action><span className="muted">Las referencias se registran; el análisis visual llegará en una fase posterior.</span></div>
          </Pane>
          <Pane title={`Referencias de ${project?.name || ""}`} icon={Palette} extra={<span className="tag">{references.length} guardadas</span>}>
            <div className="references-grid">
              {references.map(ref => <div className="reference-card" key={ref.id}><span className="tile-icon">{ref.kind === "enlace" ? <Link2 size={19}/> : <Image size={19}/>}</span><div className="grow"><strong>{ref.kind === "enlace" ? "Enlace de inspiración" : "Captura local"}</strong><small title={ref.value}>{ref.value}</small></div><button className="icon-button danger" onClick={() => deleteReference(ref.id)} title="Quitar"><X size={17}/></button></div>)}
              {!references.length && <div className="small-empty">Agrega páginas, capturas o publicaciones públicas para comenzar.</div>}
            </div>
          </Pane>
          <div className="three-col">
            <Pane title="Colores" icon={Palette}><div className="placeholder-swatches"><i/><i/><i/><i/><i/></div><p className="muted">Extracción pendiente</p></Pane>
            <Pane title="Tipografía" icon={BookOpen}><strong>Fuentes y jerarquía</strong><p className="muted">Análisis pendiente</p></Pane>
            <Pane title="Componentes" icon={Layers}><strong>Tarjetas, botones y menús</strong><p className="muted">Análisis pendiente</p></Pane>
          </div>
        </>)}
      </>;
      break;

    case "Memoria":
      main = <>
        <ViewTitle title="Memoria del proyecto" subtitle="Reglas, decisiones y contexto local para evitar repetir lo importante." icon={Brain} actions={<Action secondary icon={Download} onClick={exportData}>Exportar copia</Action>}/>
        {checkProject(<>
          <div className="stats-grid"><Stat icon={Brain} value={memories.length} label="Recuerdos"/><Stat icon={ShieldCheck} value={memories.filter(m => m.kind === "regla").length} label="Reglas"/><Stat icon={ListTodo} value={tasks.length} label="Tareas"/><Stat icon={MessageSquare} value={messages.length} label="Instrucciones"/></div>
          <Pane title="Registrar contexto" icon={SquarePen}>
            <form className="stack" onSubmit={e => {e.preventDefault(); addMemory(memoryType, memoryDraft); setMemoryDraft("");}}>
              <div className="input-row"><select value={memoryType} onChange={e => setMemoryType(e.target.value as MemoryKind)} aria-label="Tipo de recuerdo"><option value="decision">Decisión</option><option value="regla">Regla crítica</option><option value="contexto">Contexto</option></select><input value={memoryDraft} onChange={e => setMemoryDraft(e.target.value)} placeholder="Ejemplo: No modificar la autenticación al cambiar el diseño" aria-label="Nuevo recuerdo"/><Action icon={Plus} disabled={!memoryDraft.trim()}>Guardar</Action></div>
            </form>
          </Pane>
          <Pane title="Recuerdos guardados" icon={BookOpen}>
            {memories.length ? memories.map(m => <div className="memory-row" key={m.id}><span className="tag">{m.kind}</span><span className="grow">{m.text}</span><small>{at(m.createdAt)}</small><button className="icon-button danger" onClick={() => deleteMemory(m.id)} title="Eliminar recuerdo"><Trash2 size={16}/></button></div>) : <div className="small-empty">Todavía no hay recuerdos. Guarda una regla o decisión del proyecto.</div>}
          </Pane>
          <Pane title="Tareas pendientes" icon={ListTodo}>
            <form className="input-row" onSubmit={e => { e.preventDefault(); if(taskDraft.trim()){addTask(taskDraft); setTaskDraft("");}}}>
              <input aria-label="Nueva tarea" placeholder="Ejemplo: Probar notificaciones en Android" value={taskDraft} onChange={e => setTaskDraft(e.target.value)}/>
              <Action icon={Plus} disabled={!taskDraft.trim()}>Agregar</Action>
            </form>
            <div className="task-items">
              {tasks.length ? tasks.map(task => <label className="task-item" key={task.id}>
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)}/>
                <span className={task.completed ? "task-done" : ""}>{task.text}</span>
              </label>) : <p className="muted">No se han registrado tareas para este proyecto.</p>}
            </div>
          </Pane>
          <Pane title="Preparar contexto optimizado" icon={Leaf}>
            <div className="input-row">
              <input aria-label="Qué quieres hacer" placeholder="Describe qué quieres mejorar o continuar..." value={contextRequest} onChange={e => setContextRequest(e.target.value)}/>
              <select aria-label="Nivel de contexto" value={contextMode} onChange={e => setContextMode(e.target.value as ContextMode)}>
                <option value="economico">Económico</option><option value="equilibrado">Equilibrado</option><option value="profundo">Profundo</option>
              </select>
            </div>
            {preparedContext && <>
              <div className="context-summary">
                <span>≈ {preparedContext.approxTokens} tokens de entrada <small>(estimación por caracteres)</small></span>
                <span>{preparedContext.included.rules} reglas · {preparedContext.included.memories} recuerdos · {preparedContext.included.files} rutas</span>
              </div>
              <details className="context-output"><summary>Ver contexto preparado</summary>
                <textarea readOnly rows={11} value={preparedContext.text} aria-label="Contexto generado"/>
              </details>
              <div className="button-row"><Action icon={Copy} onClick={() => copyContext(contextRequest)}>Copiar contexto</Action></div>
              {preparedContext.warnings.map(w => <p className="muted" key={w}><Info size={13} className="inline-icon"/> {w}</p>)}
            </>}
          </Pane>
        </>)}
      </>;
      break;

    case "Mapa":
      main = <>
        <ViewTitle title="Mapa del proyecto" subtitle="Exploración real de carpetas y archivos, sin cargar modelos pesados." icon={Network}
          actions={project && <Action icon={RefreshCw} secondary onClick={() => refreshProject(project)}>Actualizar mapa</Action>}/>
        {checkProject(<>
          <div className="stats-grid"><Stat icon={FolderOpen} value={project?.files.filter(f => f.isDir).length || 0} label="Carpetas visibles"/><Stat icon={FileText} value={project?.fileCount || 0} label="Archivos visibles"/><Stat icon={Github} value={project?.hasGit ? "Sí" : "No"} label="Repositorio Git"/><Stat icon={Network} value={project?.kind ? kindLabel[project.kind] : "-"} label="Tipo detectado"/></div>
          <Pane title="Estructura local" icon={Network} extra={<span className="tag">Profundidad máxima: 4 niveles</span>}>
            <div className="map-visual"><div className="map-root"><FolderOpen size={24}/><strong>{project?.name}</strong><small>{project?.framework}</small></div><div className="map-links">
              {project?.files.filter(f => f.isDir && !f.path.includes("/")).slice(0,8).map(f => <div className="map-node" key={f.path}><Folder size={17}/><span>{f.path}/</span></div>)}
              {!project?.files.some(f => f.isDir) && <p className="muted">No se detectaron subcarpetas en el alcance actual.</p>}
            </div></div>
          </Pane>
          <Pane title="Explorador de archivos (solo lectura)" icon={FolderOpen}><div className="file-grid">
            {project?.files.slice(0,40).map(f => <div className="file-row" key={f.path}>{f.isDir ? <Folder size={16}/> : <FileText size={16}/>}<span>{f.path}</span></div>)}
            {!project?.files.length && <div className="small-empty">La carpeta está vacía o sus contenidos están excluidos del escaneo.</div>}
          </div></Pane>
        </>)}
      </>;
      break;

    case "Diagnóstico":
      main = <>
        <ViewTitle title="Diagnóstico" subtitle="Verificaciones estructurales locales, con resultados verificables." icon={Activity}
          actions={project && <Action icon={RefreshCw} onClick={() => refreshProject(project)}>Volver a inspeccionar</Action>}/>
        {checkProject(<>
          <div className="stats-grid"><Stat icon={FileText} value={project?.fileCount || 0} label="Archivos detectados"/><Stat icon={Folder} value={project?.files.filter(f => f.isDir).length || 0} label="Carpetas"/><Stat icon={Github} value={project?.hasGit ? "Sí" : "No"} label="Carpeta .git"/><Stat icon={Bug} value="—" label="Pruebas no ejecutadas"/></div>
          <Pane title="Resultados del escaneo" icon={ClipboardList}>
            <div className="result-row"><CheckCircle2 size={19} className="green"/><div className="grow"><strong>Carpeta accesible</strong><small>La ruta existe y se puede inspeccionar</small></div><span className="tag success">Verificado</span></div>
            <div className="result-row"><CheckCircle2 size={19} className="green"/><div className="grow"><strong>Tipo de proyecto</strong><small>{project?.framework}</small></div><span className="tag success">Detectado</span></div>
            <div className="result-row"><Info size={19} className="blue"/><div className="grow"><strong>Repositorio Git local</strong><small>{project?.hasGit ? "Se encontró la carpeta .git" : "No se encontró una carpeta .git"}</small></div><span className="tag">{project?.hasGit ? "Detectado" : "No detectado"}</span></div>
            <div className="result-row"><AlertCircle size={19} className="amber"/><div className="grow"><strong>Compilación y pruebas</strong><small>Aún no se ejecutaron tareas del proyecto</small></div><span className="tag warning">Pendiente</span></div>
          </Pane>
          <Pane title="Recomendaciones" icon={Zap}><p className="muted">Cuando incorporemos ejecutores seguros, podrás compilar, analizar dependencias y ejecutar pruebas desde botones sin terminal visible.</p></Pane>
        </>)}
      </>;
      break;

    case "Versiones":
      main = <>
        <ViewTitle title="Versiones e historial" subtitle="Consulta la actividad local; restauraciones Git vendrán después." icon={History}/>
        {checkProject(<>
          <Pane title="Actividad del proyecto" icon={History}>
            {activities.length ? activities.map(a => <div className="history-row" key={a.id}><span className="history-dot"/><div><strong>{a.text}</strong><small>{at(a.createdAt)}</small></div></div>) : <div className="small-empty">No se han registrado operaciones desde AI Code Hub.</div>}
          </Pane>
          <Pane title="Control de versiones Git" icon={GitBranch}><p className="muted">{project?.hasGit ? "Se detectó una carpeta .git. La lectura de commits y los puntos de restauración aún no están integrados." : "No se encontró .git en la carpeta raíz. Puedes inicializar Git externamente por ahora."}</p><span className="tag warning">Restauración aún no disponible</span></Pane>
        </>)}
      </>;
      break;

    case "Instaladores":
      main = <>
        <ViewTitle title="Instaladores" subtitle="Solo aplicaciones Android detectadas; los proyectos web no aparecen." icon={Smartphone}/>
        {allInstallable.length ? <>
          <Pane title="Selecciona una aplicación Android" icon={Smartphone}>
            <div className="installer-list">{allInstallable.map(p => <button key={p.id} className={`installer-option ${installProject?.id === p.id ? "chosen" : ""}`} onClick={() => setInstallId(p.id)}><span className="tile-icon"><Smartphone size={22}/></span><span className="grow"><strong>{p.name}</strong><small>{p.framework} · {p.path}</small></span><span className="tag">{installProject?.id === p.id ? "Seleccionado" : "Elegir"}</span></button>)}</div>
          </Pane>
          <Pane title="Instalar o actualizar" icon={Package}>
            <div className="installer-steps"><span><CheckCircle2 size={17}/> Proyecto Android detectado</span><span><AlertCircle size={17}/> Conexión ADB pendiente</span><span><AlertCircle size={17}/> Compilador y firma por configurar</span></div>
            <div className="button-row"><Action icon={Download} disabled>Instalar en celular · fase siguiente</Action><Action icon={RefreshCw} secondary disabled>Actualizar APK</Action></div>
            <p className="muted">La instalación real requerirá comprobar dispositivo, versión, identificador y firma antes de reemplazar una app.</p>
          </Pane>
        </> : <Empty title="Sin proyectos Android" message="Para instalar una aplicación, abre una carpeta Android/Gradle. Los proyectos web quedan excluidos automáticamente." button={<Action icon={FolderPlus} onClick={addProject}>Agregar proyecto Android</Action>}/>}
      </>;
      break;

    case "Automatizaciones":
      main = <>
        <ViewTitle title="Automatizaciones" subtitle="Diseña flujos locales reutilizables, sin usar una terminal visible." icon={Workflow}/>
        {checkProject(<>
          <Pane title="Crear un borrador de flujo" icon={Plus}>
            <form className="input-row" onSubmit={e => { e.preventDefault(); addAutomation(automationDraft); setAutomationDraft(""); }}>
              <input value={automationDraft} onChange={e => setAutomationDraft(e.target.value)} aria-label="Nombre del flujo" placeholder="Ejemplo: Ejecutar pruebas antes del commit"/>
              <Action icon={Save} disabled={!automationDraft.trim()}>Guardar borrador</Action>
            </form>
          </Pane>
          <div className="three-col">
            {[{title:"Pruebas",icon:Bug},{title:"Compilar APK",icon:Package},{title:"Respaldo",icon:ShieldCheck}].map(t => {const Icon=t.icon;return <button className="template-card" key={t.title} onClick={() => setAutomationDraft(t.title)}><Icon size={25}/><strong>{t.title}</strong><small>Usar como borrador</small></button>;})}
          </div>
          <Pane title="Flujos guardados" icon={Workflow}>
            {data.automations.filter(a => a.projectId === selectedId).length ? data.automations.filter(a=>a.projectId===selectedId).map(a => <div className="list-row" key={a.id}><span className="tile-icon"><Workflow size={18}/></span><span className="grow"><strong>{a.name}</strong><small>Creado: {at(a.createdAt)}</small></span><span className="tag warning">No ejecutable</span></div>) : <div className="small-empty">Los flujos aparecerán aquí cuando guardes uno.</div>}
          </Pane>
        </>)}
      </>;
      break;

    case "Ajustes":
      main = <>
        <ViewTitle title="Ajustes" subtitle="Personaliza rendimiento, presentación y privacidad de AI Code Hub." icon={Settings}/>
        <Pane title="Rendimiento" icon={Leaf}>
          <div className="settings-line"><div><strong>Perfil de consumo</strong><small>Controla efectos e indexación futura</small></div><select value={data.settings.performance} onChange={e=>changeSettings({performance:e.target.value as PerformanceMode})}><option value="eco">Económico</option><option value="equilibrado">Equilibrado</option></select></div>
          <div className="settings-line"><div><strong>Reducir animaciones</strong><small>Deshabilita transiciones innecesarias</small></div><input type="checkbox" checked={data.settings.reduceMotion} onChange={e=>changeSettings({reduceMotion:e.target.checked})}/></div>
          <div className="settings-line"><div><strong>Interfaz compacta</strong><small>Más contenido en menos espacio</small></div><input type="checkbox" checked={data.settings.compact} onChange={e=>changeSettings({compact:e.target.checked})}/></div>
        </Pane>
        <Pane title="Privacidad y respaldo" icon={LockKeyhole}><div className="settings-line"><div><strong>Exportar datos locales</strong><small>Descarga JSON con proyectos registrados, notas y referencias</small></div><Action secondary icon={Download} onClick={exportData}>Exportar</Action></div><p className="muted">No se guardan claves de acceso; los archivos de los proyectos permanecen en sus carpetas originales.</p></Pane>
        <Pane title="Agentes de programación" icon={Code2}><div className="agent-cards">{(["Codex","Gemini","OpenCode"] as Agent[]).map(name=><div className="agent-card" key={name}><Code2 size={20}/><strong>{name}</strong><small>Por conectar</small></div>)}</div></Pane>
      </>;
      break;
  }

  return <main className="workspace" aria-label={section}>{main}</main>;
}
