import type { HubData, Project } from "./types";

export type ContextMode = "economico" | "equilibrado" | "profundo";
export interface PreparedContext {
  text: string;
  approxTokens: number;
  approximateFullTokens: number;
  included: { rules: number; memories: number; tasks: number; files: number; references: number; messages: number };
  warnings: string[];
}

const STOP = new Set("a al ante bajo con contra de del desde el ella en entre es esta este esto la las le lo los me mi mis no o para por que se si sin su sus tu tus un una unas unos y ya".split(" "));
function tokens(s: string): string[] {
  return [...new Set((s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9_.-]{3,}/g) || []).filter(w => !STOP.has(w)))];
}
function estimate(s: string) { return Math.ceil(s.length / 4); } // Estimación grosera: NO es una cuota del proveedor.
function rank(haystack: string, keywords: string[], time: number): number {
  const value = haystack.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hits = keywords.filter(k => value.includes(k)).length;
  const days = (Date.now() - time) / (24 * 60 * 60 * 1000);
  return hits * 12 + Math.max(0, 5 - days / 14);
}
function topBy<T>(items: T[], limit: number, score: (item: T) => number): T[] {
  return [...items].sort((a,b) => score(b) - score(a)).slice(0, limit);
}

/**
 * Recolector LOCAL de contexto. No usa IA ni lee el contenido de archivos.
 * Conserva todas las reglas críticas del proyecto, aunque el límite resulte mayor.
 */
export function prepareContext(data: HubData, project: Project, request: string, mode: ContextMode): PreparedContext {
  const keywords = tokens(request);
  const caps = {
    economico: { memories: 4, tasks: 3, files: 4, references: 2, messages: 1 },
    equilibrado: { memories: 9, tasks: 6, files: 8, references: 4, messages: 3 },
    profundo: { memories: 20, tasks: 15, files: 24, references: 10, messages: 8 },
  }[mode];
  const allMemories = data.memories.filter(m => m.projectId === project.id);
  const rules = allMemories.filter(m => m.kind === "regla"); // Regla crítica: no omitir.
  const selectedMemory = topBy(
    allMemories.filter(m => m.kind !== "regla"), caps.memories,
    m => rank(m.text, keywords, m.createdAt)
  );
  const allTasks = data.tasks.filter(t => t.projectId === project.id && !t.completed);
  const selectedTasks = topBy(allTasks, caps.tasks, t => rank(t.text, keywords, t.createdAt));
  const selectedFiles = topBy(project.files.filter(f => !f.isDir), caps.files, f => rank(f.path, keywords, 0));
  const allReferences = data.references.filter(r => r.projectId === project.id);
  const selectedRefs = topBy(allReferences, caps.references, r => rank(r.value, keywords, r.createdAt));
  const allMessages = data.messages.filter(m => m.projectId === project.id);
  const selectedMessages = topBy(allMessages, caps.messages, m => rank(m.text, keywords, m.createdAt));

  const warnings = ["Solo se incluyen rutas de archivos, no su código; el asistente debe verificar el estado real antes de editar."];
  if (rules.length > 25) warnings.push("Existen más de 25 reglas críticas; revisa las redundancias para reducir contexto.");
  if (selectedMemory.length < allMemories.filter(m => m.kind !== "regla").length
   || selectedFiles.length < project.files.filter(f => !f.isDir).length) {
    warnings.push("El contexto se seleccionó por relevancia: algunas notas o rutas quedaron fuera.");
  }
  const formatted = [
    "# Contexto de AI Code Hub (generado localmente)",
    "Proyecto: " + project.name,
    "Tipo: " + project.kind + " · " + project.framework,
    "Directorio: " + project.path,
    "Solicitud actual: " + (request.trim() || "(aún no se escribió una solicitud)"),
    "",
    "## Reglas críticas — mantener siempre",
    ...(rules.length ? rules.map(r => "- " + r.text) : ["- Sin reglas críticas registradas"]),
    "",
    "## Decisiones y contexto relevantes",
    ...(selectedMemory.length ? selectedMemory.map(m => "- [" + m.kind + "] " + m.text) : ["- Sin recuerdos relacionados"]),
    "",
    "## Pendientes",
    ...(selectedTasks.length ? selectedTasks.map(t => "- " + t.text) : ["- Sin tareas pendientes"]),
    "",
    "## Rutas de código relevantes (sin leer contenidos)",
    ...(selectedFiles.length ? selectedFiles.map(f => "- " + f.path) : ["- Sin archivos detectados"]),
    "",
    "## Referencias del proyecto",
    ...(selectedRefs.length ? selectedRefs.map(r => "- [" + r.kind + "] " + r.value) : ["- Sin referencias"]),
    "",
    "## Instrucciones anteriores seleccionadas",
    ...(selectedMessages.length ? selectedMessages.map(m => "- (" + m.agent + ") " + m.text) : ["- Sin historial previo"]),
    "",
    "Instrucción de seguridad: lee los archivos necesarios y verifica cambios previos antes de editar; no asumas que este resumen refleja el estado actual del código."
  ].join("\n");

  const full = [
    ...allMemories.map(m => m.text), ...allTasks.map(t => t.text),
    ...project.files.filter(f => !f.isDir).map(f => f.path),
    ...allReferences.map(r => r.value), ...allMessages.map(m => m.text)
  ].join("\n") + request;
  return {
    text: formatted,
    approxTokens: estimate(formatted),
    approximateFullTokens: estimate(full),
    included: { rules: rules.length, memories: selectedMemory.length, tasks: selectedTasks.length,
      files: selectedFiles.length, references: selectedRefs.length, messages: selectedMessages.length },
    warnings
  };
}
