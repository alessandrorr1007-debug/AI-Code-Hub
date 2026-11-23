import test from "node:test";
import assert from "node:assert/strict";
import { prepareContext } from "../src/context.ts";

function sample() {
  return {
    project: {
      id:"project-A", path:"C:/UPAO-S", name:"UPAO S", kind:"android", framework:"Kotlin",
      hasGit:true, files:[
        {path:"app/src/ui/CursosScreen.kt",isDir:false},
        {path:"app/src/data/NotasRepository.kt",isDir:false},
        {path:"app/src/core/Auth.kt",isDir:false},
      ], fileCount:3, updatedAt:1
    },
    data: {
      schema:1, projects:[], references:[], activities:[], automations:[],
      settings:{performance:"eco",compact:true,reduceMotion:true},
      memories:[
        {id:"1",projectId:"project-A",kind:"regla",text:"Nunca cambiar la autenticación.",createdAt:1},
        {id:"2",projectId:"project-A",kind:"decision",text:"Curso usa tarjetas visuales.",createdAt:2},
        {id:"3",projectId:"project-B",kind:"regla",text:"SECRETO_DE_OTRO_PROYECTO",createdAt:3},
      ],
      tasks:[
        {id:"4",projectId:"project-A",text:"Corregir progreso de cursos",completed:false,createdAt:1},
        {id:"5",projectId:"project-A",text:"Ya resuelto",completed:true,createdAt:1}
      ],
      messages:[]
    }
  };
}
test("no filtra memorias ajenas entre proyectos",()=>{
  const {project,data}=sample();
  const context=prepareContext(data,project,"cursos","economico");
  assert.ok(!context.text.includes("SECRETO_DE_OTRO_PROYECTO"));
  assert.ok(context.text.includes("Nunca cambiar la autenticación."));
});
test("excluye tareas resueltas e identifica rutas relevantes",()=>{
  const {project,data}=sample();
  const context=prepareContext(data,project,"pantalla de cursos","economico");
  assert.ok(context.text.includes("Corregir progreso de cursos"));
  assert.ok(!context.text.includes("Ya resuelto"));
  assert.ok(context.text.includes("CursosScreen.kt"));
});
test("admite modos de contexto sin pedir una IA",()=>{
  const {project,data}=sample();
  for(const mode of ["economico","equilibrado","profundo"]) {
    const context=prepareContext(data,project,"cursos",mode);
    assert.ok(context.approxTokens>0);
    assert.equal(context.included.rules,1);
    assert.ok(context.warnings.some(w=>w.includes("rutas de archivos")));
  }
});
