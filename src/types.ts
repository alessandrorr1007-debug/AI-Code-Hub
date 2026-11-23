export type ProjectKind = "android" | "web" | "desktop" | "python" | "unknown";
export type Section =
  | "Inicio" | "Proyectos" | "Chat IA" | "Estudio Creativo" | "Memoria"
  | "Mapa" | "Diagnóstico" | "Versiones" | "Instaladores" | "Automatizaciones" | "Ajustes";
export type Agent = "Codex" | "Gemini" | "OpenCode";
export type MemoryKind = "decision" | "regla" | "contexto";
export type PerformanceMode = "eco" | "equilibrado";
export interface ProjectFile { path: string; isDir: boolean; }
export interface ProjectInfo {
  path: string; name: string; kind: ProjectKind; framework: string;
  hasGit: boolean; files: ProjectFile[]; fileCount: number;
}
export interface Project extends ProjectInfo { id: string; updatedAt: number; }
export interface MemoryEntry { id: string; projectId: string; kind: MemoryKind; text: string; createdAt: number; }
export interface RefEntry { id: string; projectId: string; kind: "enlace" | "archivo"; value: string; createdAt: number; }
export interface TaskEntry { id: string; projectId: string; text: string; completed: boolean; createdAt: number; }
export interface ConversationEntry { id: string; projectId: string; text: string; agent: Agent; createdAt: number; }
export interface ActivityEntry { id: string; projectId: string; text: string; createdAt: number; }
export interface AutomationEntry { id: string; projectId: string; name: string; createdAt: number; enabled: false; }
export interface HubSettings { performance: PerformanceMode; compact: boolean; reduceMotion: boolean; }
export interface HubData {
  schema: 1; projects: Project[]; memories: MemoryEntry[]; references: RefEntry[];
  tasks: TaskEntry[]; messages: ConversationEntry[]; activities: ActivityEntry[];
  automations: AutomationEntry[]; settings: HubSettings;
}
