// src/reminders.js

/* Ask permission if needed, resolve to 'granted' | 'denied' | 'default' */
async function ensurePermission() {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    try { return await Notification.requestPermission(); } catch { return "denied"; }
}

function notify(title, body) {
    try { new Notification(title, { body }); } catch { alert(`${title}\n${body}`); }
}

/*
  options:
  - getTodos(): current list from storage
  - setTodos(next): persist function
  - soonThresholdMinutes: (kept for API parity; not used here)
  Runs an interval every 60s to check reminders.
*/
export function initReminders({ getTodos, setTodos, soonThresholdMinutes = 60 }) {
    let timer = null;

    const tick = () => {
        const todos = getTodos();
        const now = Date.now();
        let changed = false;

        for (const t of todos) {
            if (!t || typeof t.dueAt !== "number") continue;

            const remindMins = Number(t.remindMins || 0);
            if (!remindMins) continue;

            const reminderTime = t.dueAt - remindMins * 60 * 1000;
            if (now >= reminderTime && (t.lastNotified || 0) < reminderTime) {
                notify(`Erinnerung: ${t.title || "ToDo"}`, `Fällig ${new Date(t.dueAt).toLocaleString()}`);
                t.lastNotified = reminderTime;
                changed = true;
            }
        }

        if (changed) setTodos(todos);
    };

    ensurePermission().then((perm) => {
        if (perm !== "granted") return;
        if (timer) clearInterval(timer);
        tick(); // immediate check
        timer = setInterval(tick, 60 * 1000);
        document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
    });

    return { refresh: tick };
}