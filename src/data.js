const KEY = "todo";

export const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export const save = (todos) => localStorage.setItem(KEY, JSON.stringify(todos));

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);

export const withExpandedDefault = (arr) =>
    arr.map(t => ({
        expanded: true,
        id: uid(),
        priority: "medium",
        lastNotified: 0,
        snoozeUntil: 0,
        ...t
    }));

export const countSubtasks = (todos) => {
    const { total, completed } = todos.reduce((acc, t) => {
        (t.tasks || []).forEach(task => {
            acc.total++;
            if (task.done) acc.completed++;
        });
        return acc;
    }, { total: 0, completed: 0 });
    return { totalTasks: total, completed, pending: total - completed };
};

export const toDueTimestamp = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const [y, m, d] = (dateStr || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    if (!timeStr) return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    const [hh, mm] = (timeStr || "").split(":").map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0).getTime();
};

const prioRank = (p) => (p === "high" ? 0 : p === "medium" ? 1 : 2);

export const isVisible = (t) => !(typeof t.snoozeUntil === "number" && t.snoozeUntil > Date.now());

export const bucketOf = (t) => {
    if (typeof t.dueAt !== "number") return "undated";
    const now = new Date();
    const due = new Date(t.dueAt);
    if (now.toDateString() === due.toDateString()) return "today";

    const dayOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (now.getDay() + 6) % 7; // Mon=0..Sun=6
    const monday = dayOnly(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow));
    const sunday = dayOnly(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6));
    return (due >= monday && due <= sunday) ? "week" : "later";
};

export const sortTodos = (todos) => [...todos].sort((a, b) => {
    const pa = prioRank(a.priority),
        pb = prioRank(b.priority);
    if (pa !== pb) return pa - pb;
    const da = typeof a.dueAt === "number" ? a.dueAt : Infinity;
    const db = typeof b.dueAt === "number" ? b.dueAt : Infinity;
    if (da !== db) return da - db;
    return (a.title || "").localeCompare(b.title || "");
});