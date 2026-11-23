import { isTauri, invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { ProjectInfo } from "./types";

export function isDesktop(): boolean { return isTauri(); }

export async function pickProjectFolder(): Promise<ProjectInfo | null> {
  if (!isTauri()) throw new Error("La selección de carpetas funciona en la aplicación Tauri de Windows. La vista web es solo una previsualización.");
  const path = await open({ directory: true, multiple: false, title: "Seleccionar proyecto local" });
  if (!path || Array.isArray(path)) return null;
  return invoke<ProjectInfo>("inspect_project", { path });
}
export async function refreshProjectFolder(path: string): Promise<ProjectInfo> {
  if (!isTauri()) throw new Error("Esta acción necesita la aplicación de escritorio.");
  return invoke<ProjectInfo>("inspect_project", { path });
}
export async function pickReferenceFile(): Promise<string | null> {
  if (!isTauri()) throw new Error("Para importar capturas debes ejecutar AI Code Hub como aplicación de escritorio.");
  const result = await open({ directory: false, multiple: false, title: "Seleccionar captura de referencia", filters: [{ name: "Imágenes", extensions: ["png","jpg","jpeg","webp"] }] });
  return typeof result === "string" ? result : null;
}
