import { load, save, withExpandedDefault } from "./data.js";

export function exportTodos() {
    const data = JSON.stringify(load(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `todos-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function importTodosFromFile(file, onDone) {
    const r = new FileReader();
    r.onload = () => {
        try {
            const parsed = JSON.parse(r.result);
            if (!Array.isArray(parsed)) throw new Error("Invalid format");
            save(withExpandedDefault(parsed));
            onDone && onDone(true);
        } catch (e) {
            console.error(e);
            onDone && onDone(false);
        }
    };
    r.readAsText(file);
}