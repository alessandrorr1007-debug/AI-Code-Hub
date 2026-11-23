import { useMemo, useState, type FormEvent } from "react";
import {
  Brain, CheckCircle2, ChevronRight, ClipboardCopy, Code2, FileCode2,
  FolderOpen, Info, Leaf, MessageSquare, Save, ShieldCheck, X
} from "lucide-react";
import { prepareContext, type ContextMode } from "./context";
import type { Agent, HubData, Project, Section } from "./types";

export type AssistantTab = "ia" | "contexto";
interface Props {
  project: Project | null;
  data: HubData;
  agent: Agent;
  setAgent: (next: Agent) => void;
  tab: AssistantTab;
  setTab: (next: AssistantTab) => void;
  onClose: () => void;
  onSaveInstruction: (message: string) => void;
  navigate: (section: Section) => void;
  notify: (message: string) => void;
}
const date = (time: number) => new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" }).format(time);
export function AssistantPanel({
  project, data, agent, setAgent, tab, setTab,
  onClose, onSaveInstruction, navigate, notify
}: Props) {
  const [draft, setDraft] = useState("");
  const [request, setRequest] = useState("");
  const [mode, setMode] = useState<ContextMode>("equilibrado");
  const memories = data.memories.filter(m => m.projectId === project?.id);
  const tasks = data.tasks.filter(t => t.projectId === project?.id && !t.completed);
  const messages = data.messages.filter(m => m.projectId === project?.id);
  const references = data.references.filter(r => r.projectId === project?.id);
  const prepared = useMemo(() =>
    project ? prepareContext(data, project, request || draft, mode) : null,
    [project, data, request, draft, mode]
  );
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project || !draft.trim()) return;
    onSaveInstruction(draft);
    setDraft("");
  }
  async function copyContext() {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared.text);
      notify("Contexto copiado. Puedes pegarlo en Codex, Gemini u OpenCode.");
    } catch {
      notify("No se pudo copiar automáticamente. Usa la vista de contexto para seleccionar el texto.");
      setTab("contexto");
    }
  }
  return <aside className="inspector assistant-panel" aria-label="Panel lateral del asistente IA">
    <div className="assistant-head">
      <span className="assistant-avatar"><MessageSquare size={20}/></span>
      <div className="grow"><h2>Asistente IA</h2><small>Disponible en todo el Hub</small></div>
      <button className="icon-button" aria-label="Cerrar panel de IA" title="Cerrar panel" onClick={onClose}><X size={19}/></button>
    </div>
    <div className="assistant-tabs" role="tablist" aria-label="Vista del asistente">
      <button type="button" role="tab" aria-selected={tab === "ia"}
        className={tab === "ia" ? "active" : ""} onClick={() => setTab("ia")}><MessageSquare size={15}/> IA</button>
      <button type="button" role="tab" aria-selected={tab === "contexto"}
        className={tab === "contexto" ? "active" : ""} onClick={() => setTab("contexto")}><Brain size={15}/> Contexto</button>
    </div>

    {tab === "ia" ? <>
      <div className="assistant-agent-area">
        <div className="assistant-small-label">Agente seleccionado</div>
        <div className="assistant-agents" role="group" aria-label="Elegir agente de programación">
          {(["Codex", "Gemini", "OpenCode"] as Agent[]).map(name =>
            <button type="button" key={name} className={agent === name ? "active" : ""}
              onClick={() => setAgent(name)}>{name}</button>)}
        </div>
        <div className="assistant-connection"><span className="status-pending"/> Conexión pendiente · solo notas locales</div>
      </div>
      <div className="assistant-session">
        {project ? <>
          <div className="assistant-project"><FolderOpen size={16}/><div className="grow"><strong>{project.name}</strong><small>{project.framework}</small></div><span className="tag">Local</span></div>
          <div className="assistant-messages" aria-label="Instrucciones guardadas">
            {messages.length ? [...messages].reverse().map(item =>
              <div className="assistant-message" key={item.id}>
                <div className="assistant-message-head"><strong>Tu instrucción · {item.agent}</strong><small>{date(item.createdAt)}</small></div>
                <p>{item.text}</p>
              </div>) :
              <div className="assistant-empty">
                <MessageSquare size={26}/>
                <strong>Tu asistente de trabajo</strong>
                <p>Escribe instrucciones y guárdalas para continuar el proyecto. Las respuestas de IA se activarán cuando conectemos los agentes.</p>
              </div>}
          </div>
        </> : <div className="assistant-empty"><FolderOpen size={29}/><strong>Selecciona un proyecto</strong><p>Abre una carpeta desde Proyectos. Su memoria y sus notas aparecerán aquí.</p><button className="btn secondary" onClick={() => navigate("Proyectos")}>Ir a proyectos <ChevronRight size={15}/></button></div>}
      </div>
      <div className="assistant-composer">
        <button className="assistant-context-link" disabled={!project} onClick={() => setTab("contexto")}>
          <Leaf size={15}/> {memories.length} recuerdos · {tasks.length} tareas · {references.length} referencias <ChevronRight size={14}/>
        </button>
        <form onSubmit={handleSubmit}>
          <textarea aria-label="Instrucción de trabajo" rows={4} value={draft} onChange={e => setDraft(e.target.value)}
            disabled={!project} placeholder={project ? `Escribe una instrucción para ${agent}...` : "Selecciona un proyecto para comenzar"}/>
          <div className="assistant-composer-buttons">
            <button type="button" className="btn secondary" disabled={!project} onClick={copyContext}><ClipboardCopy size={15}/> Copiar contexto</button>
            <button type="submit" className="btn" disabled={!project || !draft.trim()}><Save size={15}/> Guardar nota</button>
          </div>
        </form>
        <p className="assistant-safety"><ShieldCheck size={13}/> Sin envío a IA; ningún token consumido.</p>
      </div>
    </> : <>
      <div className="assistant-context-scroll">
        {project && prepared ? <>
          <div className="assistant-project"><FolderOpen size={16}/><div className="grow"><strong>{project.name}</strong><small>Contexto privado y local</small></div></div>
          <div className="assistant-context-stats">
            <span><Brain size={16}/> {memories.length} recuerdos</span>
            <span><CheckCircle2 size={16}/> {tasks.length} tareas</span>
            <span><FileCode2 size={16}/> {project.fileCount} archivos</span>
          </div>
          <label className="assistant-field">Modo de preparación
            <select value={mode} onChange={e => setMode(e.target.value as ContextMode)}>
              <option value="economico">Económico</option>
              <option value="equilibrado">Equilibrado</option>
              <option value="profundo">Profundo</option>
            </select>
          </label>
          <label className="assistant-field">¿Qué necesitas hacer?
            <textarea rows={3} value={request} onChange={e => setRequest(e.target.value)}
              placeholder="Ejemplo: mejorar la pantalla de cursos sin modificar su lógica"/>
          </label>
          <div className="assistant-token-estimate"><strong>≈ {prepared.approxTokens}</strong><small>tokens estimados (no cuota real)</small></div>
          <div className="assistant-context-counts">Incluye {prepared.included.rules} reglas, {prepared.included.memories} recuerdos, {prepared.included.files} rutas y {prepared.included.tasks} tareas.</div>
          <label className="assistant-field">Contexto preparado
            <textarea className="assistant-context-text" value={prepared.text} readOnly rows={12} aria-label="Texto del contexto preparado"/>
          </label>
          <button className="btn assistant-copy" onClick={copyContext}><ClipboardCopy size={16}/> Copiar contexto</button>
          <button className="assistant-text-link" onClick={() => navigate("Memoria")}><Brain size={14}/> Administrar memoria <ChevronRight size={14}/></button>
          {prepared.warnings.map(w => <p className="assistant-warning" key={w}><Info size={14}/> {w}</p>)}
        </> : <div className="assistant-empty"><Brain size={27}/><strong>Sin proyecto activo</strong><p>La memoria es independiente para cada proyecto. Selecciona uno para preparar su contexto.</p><button className="btn secondary" onClick={() => navigate("Proyectos")}>Ir a proyectos <ChevronRight size={14}/></button></div>}
      </div>
    </>}
  </aside>;
}
