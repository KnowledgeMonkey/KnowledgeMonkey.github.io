// src/dnd.js
import { load, save } from "./data.js";

/*
  enableListDnD({ listEl, onAfterReorder })
  - listEl is the UL (bucket-list) parent we attach to
  - items have data-id on <li> for todo id
*/
export function enableListDnD({ listEl, onAfterReorder }) {
    let dragEl = null;

    listEl.addEventListener("dragstart", (e) => {
        const li = e.target.closest("li[data-id]");
        if (!li) return;
        dragEl = li;
        li.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
    });

    listEl.addEventListener("dragend", () => {
        if (dragEl) dragEl.classList.remove("dragging");
        dragEl = null;
    });

    listEl.addEventListener("dragover", (e) => {
        if (!dragEl) return;
        e.preventDefault();
        const after = getDragAfterElement(listEl, e.clientY);
        if (after == null) {
            listEl.appendChild(dragEl);
        } else {
            listEl.insertBefore(dragEl, after);
        }
    });

    listEl.addEventListener("drop", () => {
        const ids = [...listEl.querySelectorAll("li[data-id]")].map(li => li.getAttribute("data-id"));
        // reorder storage to match ids
        const arr = load();
        const byId = new Map(arr.map(x => [x.id, x]));
        const next = ids.map(id => byId.get(id)).filter(Boolean);
        // also keep non-visible items (in other buckets or snoozed)
        for (const t of arr)
            if (!byId.has(t.id)) next.push(t);
        save(next);
        onAfterReorder && onAfterReorder();
    });
}

function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll("li[data-id]:not(.dragging)")];
    let closest = null;
    let closestOffset = Number.NEGATIVE_INFINITY;
    for (const el of els) {
        const box = el.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closest = el;
        }
    }
    return closest;
}

/*
  enableSubtaskDnD({ ulEl, todoIndex, onAfter })
  - subtask <li> rows must carry data-subindex
*/
export function enableSubtaskDnD({ ulEl, todoIndex, onAfter }) {
    let dragRow = null;

    ulEl.addEventListener("dragstart", (e) => {
        const row = e.target.closest("li[data-subindex]");
        if (!row) return;
        dragRow = row;
        row.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
    });

    ulEl.addEventListener("dragend", () => {
        if (dragRow) dragRow.classList.remove("dragging");
        dragRow = null;
    });

    ulEl.addEventListener("dragover", (e) => {
        if (!dragRow) return;
        e.preventDefault();
        const after = getDragAfterElement(ulEl, e.clientY);
        if (after == null) ulEl.appendChild(dragRow);
        else ulEl.insertBefore(dragRow, after);
    });

    ulEl.addEventListener("drop", () => {
        const arr = load();
        const t = arr[todoIndex];
        if (!t || !Array.isArray(t.tasks)) return;
        const order = [...ulEl.querySelectorAll("li[data-subindex]")]
            .map((li) => Number(li.getAttribute("data-subindex")));
        const next = order.map(idx => t.tasks[idx]).filter(Boolean);
        t.tasks = next;
        save(arr);
        onAfter && onAfter();
    });
}