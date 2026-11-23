import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen, MessageSquare, Sparkles, Brain, Network, Activity, History,
  Smartphone, Workflow, Settings, Search, ChevronDown, Menu, Code2, Github,
  Monitor, PanelRightClose, PanelRightOpen, Leaf, ShieldCheck, CircleHelp, Bell,
  FolderPlus, Download, Info, Zap, X
} from "lucide-react";
import type {
  Section, Agent, HubData, Project, ProjectInfo, MemoryKind, PerformanceMode
} from "./types";
import { loadWorkspace, initializeWorkspace, persistWorkspace, exportWorkspace } from "./storage";
import { pickProjectFolder, refreshProjectFolder, pickReferenceFile, isDesktop } from "./desktop";
import { WorkspaceView } from "./sections";
import { AssistantPanel, type AssistantTab } from "./AssistantPanel";

const NAV: { title: Section; icon: typeof FolderOpen }[] = [
  { title: "Proyectos", icon: FolderOpen }, { title: "Estudio Creativo", icon: Sparkles },
  { title: "Memoria", icon: Brain }, { title: "Mapa", icon: Network },
  { title: "Diagnóstico", icon: Activity }, { title: "Versiones", icon: History },
  { title: "Instaladores", icon: Smartphone }, { title: "Automatizaciones", icon: Workflow },
  { title: "Ajustes", icon: Settings }
];
const id = () => crypto.randomUUID();
const message = (error: unknown) => error instanceof Error ? error.message : String(error);

export default function App() {
  const [data, setData] = useState<HubData>(loadWorkspace);
  const [hydrated, setHydrated] = useState<boolean>(!isDesktop());
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem("ai-code-hub:selected") || "");
  const [section, setSection] = useState<Section>("Proyectos");
  const [agent, setAgent] = useState<Agent>("Codex");
  const [rightPanel, setRightPanel] = useState(true);
  const [assistantTab, setAssistantTab] = useState<AssistantTab>("ia");
  const [navOpen, setNavOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const project = useMemo(() => data.projects.find(p => p.id === activeId) || null, [data.projects, activeId]);
  useEffect(() => {
    if (!isDesktop()) return;
    let cancelled = false;
    initializeWorkspace()
      .then(workspace => {
        if (cancelled) return;
        setData(workspace);
        setHydrated(true);
      })
      .catch(error => {
        if (!cancelled) setNotice("No se pudo abrir la memoria SQLite: " + message(error));
      });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    // Cambios de workspace son discretos (los borradores de formularios no modifican data).
    // Guardar sin espera evita perder notas al cerrar la ventana inmediatamente.
    persistWorkspace(data).catch(error =>
      setNotice("Error guardando la memoria: " + message(error) + ". Exporta una copia en Ajustes.")
    );
  }, [data, hydrated]);
  useEffect(() => { localStorage.setItem("ai-code-hub:selected", activeId); }, [activeId]);
  useEffect(() => {
    document.documentElement.dataset.mode = data.settings.performance;
    document.documentElement.dataset.compact = String(data.settings.compact);
    document.documentElement.dataset.reduceMotion = String(data.settings.reduceMotion);
  }, [data.settings]);

  function record(projectId: string, text: string) {
    return { id: id(), projectId, text, createdAt: Date.now() };
  }
  async function addProject() {
    try {
      setBusy(true);
      const info = await pickProjectFolder();
      if (!info) return;
      const old = data.projects.find(p => p.path === info.path);
      if (old) {
        setActiveId(old.id);
        setNotice("El proyecto ya estaba registrado.");
      } else {
        const current = { ...info, id: id(), updatedAt: Date.now() };
        setData(prev => ({ ...prev, projects: [current, ...prev.projects],
          activities: [record(current.id, "Proyecto local agregado"), ...prev.activities].slice(0, 200) }));
        setActiveId(current.id);
        setNotice("Carpeta registrada; los archivos no se han modificado.");
      }
      setSection("Proyectos");
    } catch (error) { setNotice(message(error)); }
    finally { setBusy(false); }
  }
  async function refreshProject(target: Project) {
    try {
      setBusy(true);
      const info: ProjectInfo = await refreshProjectFolder(target.path);
      setData(prev => ({ ...prev, projects: prev.projects.map(p =>
        p.id === target.id ? { ...p, ...info, updatedAt: Date.now() } : p) }));
      setNotice("Información del proyecto actualizada.");
    } catch (error) { setNotice(message(error)); }
    finally { setBusy(false); }
  }
  function deleteProject(target: Project) {
    if (!window.confirm(`¿Quitar "${target.name}" del Hub? No se borrará su carpeta.`)) return;
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== target.id) }));
    if (activeId === target.id) setActiveId("");
  }
  function requireProject(): string | null {
    if (!project) { setNotice("Primero abre o selecciona un proyecto desde Proyectos."); return null; }
    return project.id;
  }
  function addMemory(kind: MemoryKind, text: string) {
    const projectId = requireProject();
    if (!projectId || !text.trim()) return;
    setData(prev => ({ ...prev, memories: [{ id: id(), projectId, kind, text: text.trim(), createdAt: Date.now() }, ...prev.memories],
      activities: [record(projectId, "Memoria agregada"), ...prev.activities].slice(0, 200) }));
  }
  function deleteMemory(memoryId: string) {
    setData(prev => ({ ...prev, memories: prev.memories.filter(m => m.id !== memoryId) }));
  }
  function addReference(value: string, kind: "enlace" | "archivo") {
    const projectId = requireProject();
    if (!projectId || !value.trim()) return;
    if (kind === "enlace") {
      try { const parsed = new URL(value); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); }
      catch { setNotice("Pega un enlace HTTP o HTTPS válido."); return; }
    }
    setData(prev => ({ ...prev, references: [{ id: id(), projectId, value: value.trim(), kind, createdAt: Date.now() }, ...prev.references],
      activities: [record(projectId, "Referencia visual agregada"), ...prev.activities].slice(0, 200) }));
  }
  async function addReferenceFile() {
    try {
      const path = await pickReferenceFile();
      if (path) addReference(path, "archivo");
    } catch (error) { setNotice(message(error)); }
  }
  function deleteReference(refId: string) {
    setData(prev => ({ ...prev, references: prev.references.filter(r => r.id !== refId) }));
  }
  function addTask(text: string) {
    const projectId = requireProject();
    if (!projectId || !text.trim()) return;
    setData(prev => ({ ...prev, tasks: [{ id: id(), projectId, text: text.trim(), completed: false, createdAt: Date.now() }, ...prev.tasks] }));
  }
  function toggleTask(taskId: string) {
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) }));
  }
  function addMessage(text: string) {
    const projectId = requireProject();
    if (!projectId || !text.trim()) return;
    setData(prev => ({ ...prev, messages: [{ id: id(), projectId, text: text.trim(), agent, createdAt: Date.now() }, ...prev.messages],
      activities: [record(projectId, "Instrucción guardada para " + agent), ...prev.activities].slice(0, 200) }));
  }
  function addAutomation(name: string) {
    const projectId = requireProject();
    if (!projectId || !name.trim()) return;
    setData(prev => ({ ...prev, automations: [{ id: id(), projectId, name: name.trim(), createdAt: Date.now(), enabled: false }, ...prev.automations] }));
  }
  function changeSettings(changes: Partial<HubData["settings"]>) {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...changes } }));
  }
  function exportData() {
    try { exportWorkspace(data); setNotice("Se preparó la descarga de la copia de tu espacio."); }
    catch (error) { setNotice(message(error)); }
  }
  const go = (next: Section) => { setSection(next); setNavOpen(false); setQuery(""); };
  const openAssistant = (tab: AssistantTab = "ia") => { setAssistantTab(tab); setRightPanel(true); };

  if (!hydrated) return <div className="startup"><Brain size={30}/><strong>AI Code Hub</strong><p>Preparando la memoria local protegida...</p><p className="muted">Si hay un error, se mostrará el mensaje sin sobrescribir tus datos.</p>{notice && <p className="startup-error">{notice}</p>}</div>;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${navOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-icon"><Code2 size={24}/></span><div className="brand-text"><strong>AI Code Hub</strong><small>Tu entorno de desarrollo con IA</small></div><span className="version-tag">v0.1</span></div>
        <nav className="nav-list" aria-label="Navegación principal">
          {NAV.map(item => {
            const Icon = item.icon;
            return <button className={`nav-link ${section === item.title ? "active" : ""}`} key={item.title} onClick={() => go(item.title)} aria-current={section === item.title ? "page" : undefined}><Icon size={19}/><span>{item.title}</span></button>;
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="efficiency"><Leaf size={18}/><div><strong>Modo ligero</strong><small>{data.settings.performance === "eco" ? "Consumo mínimo" : "Equilibrado"}</small></div><span className="status-dot"/></div>
          <div className="footnote"><ShieldCheck size={15}/> Datos de trabajo locales</div>
        </div>
      </aside>
      {navOpen && <button className="mobile-overlay" aria-label="Cerrar menú" onClick={() => setNavOpen(false)}/>}
      <div className="app-body">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setNavOpen(!navOpen)} aria-label="Abrir menú"><Menu size={21}/></button>
          <div className="top-project"><FolderOpen size={17}/>
            <select aria-label="Proyecto seleccionado" value={project?.id || ""} onChange={e => setActiveId(e.target.value)}>
              <option value="">Sin proyecto</option>
              {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select><ChevronDown size={13}/>
          </div>
          <label className="top-search"><Search size={18}/><input aria-label="Buscar proyectos" value={query} placeholder="Buscar proyectos..." onFocus={() => setSection("Proyectos")} onChange={e => setQuery(e.target.value)}/><kbd>Ctrl K</kbd></label>
          <button className="top-assistant-btn" onClick={() => openAssistant("ia")}
            title="Abrir asistente de programación"><MessageSquare size={17}/> Asistente IA <span>{agent}</span></button>
          <button className="icon-button panel-toggle" onClick={() => setRightPanel(!rightPanel)} aria-label={rightPanel ? "Ocultar panel contextual" : "Mostrar panel contextual"}>{rightPanel ? <PanelRightClose size={19}/> : <PanelRightOpen size={19}/>}</button>
          <button className="icon-button" onClick={() => go("Ajustes")} aria-label="Ajustes"><Settings size={19}/></button>
        </header>
        <div className={`content-layout ${rightPanel ? "" : "no-inspector"}`}>
          <WorkspaceView
            section={section} data={data} project={project} agent={agent}
            query={query} busy={busy} desktop={isDesktop()}
            navigate={go} setAgent={setAgent} selectProject={setActiveId}
            addProject={addProject} refreshProject={refreshProject} deleteProject={deleteProject}
            addMemory={addMemory} deleteMemory={deleteMemory}
            addReference={addReference} addReferenceFile={addReferenceFile} deleteReference={deleteReference}
            addTask={addTask} toggleTask={toggleTask} addMessage={addMessage}
            addAutomation={addAutomation} changeSettings={changeSettings}
            exportData={exportData} showNotice={setNotice} openAssistant={openAssistant}
          />
          {rightPanel && <AssistantPanel project={project} data={data} agent={agent}
            setAgent={setAgent} tab={assistantTab} setTab={setAssistantTab}
            onClose={() => setRightPanel(false)} onSaveInstruction={addMessage}
            navigate={go} notify={setNotice}/>}

        </div>
        <footer className="statusbar"><span><span className="status-dot"/> {isDesktop() ? "Aplicación de escritorio" : "Vista web de desarrollo"}</span><span><Github size={14}/> Repositorio preparado</span><span className="status-right"><Monitor size={14}/> {data.settings.performance === "eco" ? "Económico" : "Equilibrado"} <span className="subtle">· IA sin conectar</span></span></footer>
      </div>
      {notice && <div className="toast" role="status"><Info size={17}/><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Cerrar aviso"><X size={16}/></button></div>}
    </div>
  );
}
