// src/dnd.js
import { load, save } from "./data.js";

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const getAfter = (container, y) => {
    let closest = null,
        off = Number.NEGATIVE_INFINITY;
    for (const el of $$("li[data-id], li[data-subindex]", container).filter(el => !el.classList.contains("dragging"))) {
        const box = el.getBoundingClientRect();
        const d = y - box.top - box.height / 2;
        if (d < 0 && d > off) { off = d;
            closest = el; }
    }
    return closest;
};

function attachDnD(container, itemAttr, onReorder) {
    let dragging = null;

    container.addEventListener("dragstart", e => {
        const li = e.target.closest(`li[${itemAttr}]`);
        if (!li) return;
        dragging = li;
        li.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
    });

    container.addEventListener("dragend", () => {
        if (dragging) dragging.classList.remove("dragging");
        dragging = null;
    });

    container.addEventListener("dragover", e => {
        if (!dragging) return;
        e.preventDefault();
        const after = getAfter(container, e.clientY);
        after ? container.insertBefore(dragging, after) : container.appendChild(dragging);
    });

    container.addEventListener("drop", () => {
        if (onReorder) onReorder();
    });
}

/* -------- Public API -------- */

export function enableListDnD({ listEl, onAfterReorder }) {
    attachDnD(listEl, "data-id", () => {
        const ids = $$("li[data-id]", listEl).map(li => li.getAttribute("data-id"));
        const arr = load();
        const byId = new Map(arr.map(x => [x.id, x]));
        const next = ids.map(id => byId.get(id)).filter(Boolean);
        for (const t of arr)
            if (!byId.has(t.id)) next.push(t); // keep items not in this list
        save(next);
        onAfterReorder && onAfterReorder();
    });
}

export function enableSubtaskDnD({ ulEl, todoIndex, onAfter }) {
    attachDnD(ulEl, "data-subindex", () => {
        const arr = load();
        const t = arr[todoIndex];
        if (!t || !Array.isArray(t.tasks)) return;
        const order = $$("li[data-subindex]", ulEl).map(li => Number(li.getAttribute("data-subindex")));
        t.tasks = order.map(i => t.tasks[i]).filter(Boolean);
        save(arr);
        onAfter && onAfter();
    });
}