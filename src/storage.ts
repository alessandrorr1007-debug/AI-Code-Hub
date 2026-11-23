import { isTauri, invoke } from "@tauri-apps/api/core";
import type { HubData } from "./types";
const KEY = "ai-code-hub:workspace:v1";
export const DEFAULT_DATA: HubData = {
  schema: 1, projects: [], memories: [], references: [], tasks: [],
  messages: [], activities: [], automations: [],
  settings: { performance: "equilibrado", compact: true, reduceMotion: true }
};
export function loadWorkspace(): HubData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<HubData> | null;
    if (!parsed || parsed.schema !== 1 || !Array.isArray(parsed.projects)) return DEFAULT_DATA;
    return {
      ...DEFAULT_DATA, ...parsed,
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      references: Array.isArray(parsed.references) ? parsed.references : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      automations: Array.isArray(parsed.automations) ? parsed.automations : [],
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings }
    };
  } catch { return DEFAULT_DATA; }
}
export function saveWorkspace(data: HubData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}
export function exportWorkspace(data: HubData): void {
  const contents = JSON.stringify(data, null, 2);
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ai-code-hub-workspace.json";
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Desktop: SQLite is the authoritative local store.
 * When upgrading from v0.1, copy existing WebView data to SQLite exactly once.
 * Browser preview keeps its own localStorage store; it never connects to a server.
 */
export async function initializeWorkspace(): Promise<HubData> {
  const legacy = loadWorkspace();
  if (!isTauri()) return legacy;
  const raw = await invoke<string | null>("load_workspace");
  if (raw !== null) {
    let parsed: HubData;
    try { parsed = JSON.parse(raw) as HubData; }
    catch { throw new Error("La base SQLite contiene un estado inválido: exporta y revisa los datos antes de continuar."); }
    if (parsed.schema !== 1 || !Array.isArray(parsed.projects)) {
      throw new Error("La versión de la memoria SQLite no es compatible; no se sobrescribirán los datos.");
    }
    return { ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_DATA.settings, ...parsed.settings } };
  }
  // No prior SQLite state: migrate the complete previous workspace.
  await invoke("save_workspace", { data: JSON.stringify(legacy) });
  return legacy;
}
export async function persistWorkspace(data: HubData): Promise<void> {
  if (isTauri()) await invoke("save_workspace", { data: JSON.stringify(data) });
  // A local-only emergency backup also keeps browser previews usable.
  saveWorkspace(data);
}
