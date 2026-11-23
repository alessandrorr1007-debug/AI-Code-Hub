import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("la navegación principal conserva las nueve secciones acordadas", () => {
  const app = read("src/App.tsx");
  const nav = app.split("const NAV:")[1]?.split("const id =")[0] || "";
  const titles = [...nav.matchAll(/title: "([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(titles, [
    "Proyectos", "Estudio Creativo", "Memoria", "Mapa", "Diagnóstico",
    "Versiones", "Instaladores", "Automatizaciones", "Ajustes"
  ]);
  assert.match(app, /useState<Section>\("Proyectos"\)/);
  assert.doesNotMatch(nav, /Inicio|Chat IA/);
});

test("el asistente está integrado a la derecha y tiene IA y Contexto", () => {
  const app = read("src/App.tsx");
  const panel = read("src/AssistantPanel.tsx");
  const views = read("src/sections.tsx");
  assert.match(app, /rightPanel && <AssistantPanel/);
  assert.match(panel, /role="tablist"/);
  assert.match(panel, /tab === "ia"/);
  assert.match(panel, /tab === "contexto"/);
  assert.match(panel, /Conexión pendiente/);
  assert.match(panel, /Sin envío a IA/);
  assert.doesNotMatch(views, /case "Inicio":|case "Chat IA":/);
});

test("la lista de secciones tipadas no incluye Inicio ni Chat IA", () => {
  const types = read("src/types.ts");
  const section = types.split("export type Section =")[1]?.split("export type Agent")[0] || "";
  assert.ok(section.includes('"Proyectos"'));
  assert.ok(!section.includes('"Inicio"'));
  assert.ok(!section.includes('"Chat IA"'));
});
