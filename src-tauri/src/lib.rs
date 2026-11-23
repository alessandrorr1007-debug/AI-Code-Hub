mod projects;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![projects::inspect_project])
        .run(tauri::generate_context!())
        .expect("No se pudo iniciar AI Code Hub");
}
