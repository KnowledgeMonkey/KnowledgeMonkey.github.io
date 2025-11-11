const KEY = "todo";

export function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
export function save(todos) { localStorage.setItem(KEY, JSON.stringify(todos)); }

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36).slice(4);
}

export function withExpandedDefault(arr) {
    return arr.map(t => {
        if (typeof t.expanded === "undefined") t.expanded = true;
        if (!t.id) t.id = uid();
        if (!t.priority) t.priority = "medium";
        if (typeof t.lastNotified !== "number") t.lastNotified = 0;
        if (typeof t.snoozeUntil !== "number") t.snoozeUntil = 0;
        return t;
    });
}

export function countSubtasks(todos) {
    let totalTasks = 0,
        completed = 0;
    for (const t of todos)
        for (const task of(t.tasks || [])) {
            totalTasks++;
            if (task.done) completed++;
        }
    return { totalTasks, completed, pending: totalTasks - completed };
}

export function toDueTimestamp(dateStr, timeStr) {
    if (!dateStr) return null;
    const [y, m, d] = (dateStr || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    if (!timeStr) return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    const [hh, mm] = (timeStr || "").split(":").map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0).getTime();
}

function prioRank(p) {
    if (p === "high") return 0;
    if (p === "medium") return 1;
    return 2;
}

/* visibility: hide if snoozed in the future */
export function isVisible(t) {
    const now = Date.now();
    return !(typeof t.snoozeUntil === "number" && t.snoozeUntil > now);
}

/* buckets: today / this week / later / undated */
export function bucketOf(t) {
    if (typeof t.dueAt !== "number") return "undated";
    const now = new Date();
    const due = new Date(t.dueAt);
    // today
    const sameDay = now.toDateString() === due.toDateString();
    if (sameDay) return "today";
    // same week (Mon-Sun)
    const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const monday = day(new Date(now.setDate(now.getDate() - ((now.getDay() + 6) % 7))));
    const sunday = day(new Date(monday));
    sunday.setDate(monday.getDate() + 6);
    if (due >= monday && due <= sunday) return "week";
    return "later";
}

/* sort by priority, due date, title */
export function sortTodos(todos) {
    const copy = todos.slice();
    copy.sort((a, b) => {
        const PA = prioRank(a.priority),
            PB = prioRank(b.priority);
        if (PA !== PB) return PA - PB;
        const A = typeof a.dueAt === "number" ? a.dueAt : Infinity;
        const B = typeof b.dueAt === "number" ? b.dueAt : Infinity;
        if (A !== B) return A - B;
        return (a.title || "").localeCompare(b.title || "");
    });
    return copy;
}