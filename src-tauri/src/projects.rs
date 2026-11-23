use serde::Serialize;
use std::{fs, path::{Path, PathBuf}};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFile { path: String, is_dir: bool }

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfo {
    path: String, name: String, kind: String, framework: String,
    has_git: bool, files: Vec<ProjectFile>, file_count: usize,
}

fn exists(root: &Path, path: &str) -> bool { root.join(path).exists() }

#[tauri::command]
pub fn inspect_project(path: String) -> Result<ProjectInfo, String> {
    let root = fs::canonicalize(&path).map_err(|err| format!("No se puede acceder: {err}"))?;
    if !root.is_dir() { return Err("Selecciona una carpeta válida".into()); }
    let name = root.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "Proyecto".into());
    let is_android = exists(&root, "settings.gradle") || exists(&root, "settings.gradle.kts")
        || exists(&root, "app/build.gradle") || exists(&root, "app/build.gradle.kts");
    let is_desktop = exists(&root, "src-tauri/tauri.conf.json");
    let is_web = exists(&root, "package.json");
    let is_python = exists(&root, "pyproject.toml") || exists(&root, "requirements.txt");
    let (kind, framework) = if is_android { ("android", "Android / Gradle") }
        else if is_desktop { ("desktop", "Tauri") }
        else if is_web { ("web", "JavaScript / TypeScript") }
        else if is_python { ("python", "Python / IA") }
        else { ("unknown", "Sin detectar") };

    let mut files = Vec::<ProjectFile>::new();
    scan(&root, &root, 0, &mut files);
    let file_count = files.iter().filter(|f| !f.is_dir).count();
    Ok(ProjectInfo {
        path: root.to_string_lossy().to_string(), name, kind: kind.into(),
        framework: framework.into(), has_git: exists(&root, ".git"), files, file_count,
    })
}
fn scan(root: &Path, dir: &Path, depth: usize, out: &mut Vec<ProjectFile>) {
    if depth > 3 || out.len() >= 180 { return; }
    let mut entries: Vec<PathBuf> = match fs::read_dir(dir) {
        Ok(read_dir) => read_dir.filter_map(|e| e.ok().map(|it| it.path())).collect(),
        Err(_) => return,
    };
    entries.sort();
    for entry in entries {
        if out.len() >= 180 { break; }
        let name = entry.file_name().unwrap_or_default().to_string_lossy().to_string();
        if [".git","node_modules","target","dist",".next","build",".gradle",".idea",".venv","venv"].contains(&name.as_str()) { continue; }
        let is_dir = entry.is_dir();
        if let Ok(rel) = entry.strip_prefix(root) {
            out.push(ProjectFile { path: rel.to_string_lossy().replace('\\', "/"), is_dir });
        }
        if is_dir && !entry.is_symlink() { scan(root, &entry, depth + 1, out); }
    }
}
