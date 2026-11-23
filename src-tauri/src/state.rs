//! Persistencia local y privada del estado del Hub.
 //! Solo se escribe después de la autorización local del usuario; no se envían datos a la nube.
use rusqlite::{params, Connection, OptionalExtension};
use std::{fs, path::PathBuf};
use tauri::Manager;

fn workspace_db(app: &tauri::AppHandle) -> Result<Connection, String> {
    let root: PathBuf = app.path().app_data_dir().map_err(|e| format!("No se encontró la carpeta local del Hub: {e}"))?;
    fs::create_dir_all(&root).map_err(|e| format!("No se pudo crear la carpeta de datos: {e}"))?;
    let db = Connection::open(root.join("workspace.db")).map_err(|e| format!("No se pudo abrir SQLite: {e}"))?;
    db.busy_timeout(std::time::Duration::from_secs(3)).map_err(|e| e.to_string())?;
    db.execute_batch(
        "PRAGMA journal_mode=WAL;
         PRAGMA synchronous=FULL;
         CREATE TABLE IF NOT EXISTS hub_state (
             id INTEGER PRIMARY KEY CHECK (id = 1),
             payload TEXT NOT NULL,
             updated_at INTEGER NOT NULL
         );"
    ).map_err(|e| format!("No se pudo preparar la base local: {e}"))?;
    Ok(db)
}

#[tauri::command]
pub fn load_workspace(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let db = workspace_db(&app)?;
    db.query_row("SELECT payload FROM hub_state WHERE id = 1", [], |r| r.get(0))
        .optional().map_err(|e| format!("No se pudo leer la memoria del Hub: {e}"))
}

#[tauri::command]
pub fn save_workspace(app: tauri::AppHandle, data: String) -> Result<(), String> {
    // El tamaño máximo protege la aplicación de estados corruptos o enormes.
    const MAX_BYTES: usize = 16 * 1024 * 1024;
    if data.len() > MAX_BYTES { return Err("La memoria local supera el límite seguro de 16 MB; exporta y depura antes de continuar.".into()); }
    let value: serde_json::Value = serde_json::from_str(&data)
        .map_err(|_| "Los datos recibidos no son JSON válido".to_string())?;
    if value.get("schema").and_then(|s| s.as_u64()) != Some(1)
        || !value.get("projects").map(|v| v.is_array()).unwrap_or(false) {
        return Err("La versión de memoria no es compatible".into());
    }
    let mut db = workspace_db(&app)?;
    let tx = db.transaction().map_err(|e| e.to_string())?;
    tx.execute(
        "INSERT INTO hub_state (id, payload, updated_at) VALUES (1, ?1, strftime('%s', 'now'))
         ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at",
        params![data],
    ).map_err(|e| format!("No se pudo guardar la memoria: {e}"))?;
    tx.commit().map_err(|e| format!("No se pudo confirmar el guardado: {e}"))?;
    Ok(())
}
