import {
    load,
    save,
    withExpandedDefault,
    countSubtasks,
    toDueTimestamp,
    sortTodos,
    isVisible,
    bucketOf
} from "./data.js";
import { initChart, updateChart } from "./chart.js";
import { fileToDataURL, addThumb, openLightbox } from "./images.js";
import { renderReadItem, renderEditItem } from "./render.js";
import { initReminders } from "./reminders.js";
import { exportTodos, importTodosFromFile } from "./io.js";
import { enableListDnD, enableSubtaskDnD } from "./dnd.js";
import { getTemplate } from "./templates.js";
import { exportListsToPDF } from "./pdfExport.js";

const titleInput = document.getElementById("title");
const subtaskInput = document.getElementById("subtask");
const addSubtaskBtn = document.getElementById("addSubtask");
const subtaskList = document.getElementById("subtaskList");
const addBtn = document.getElementById("add");
const listRoot = document.getElementById("list"); // will contain buckets

const dateInput = document.getElementById("dueDate");
const timeInput = document.getElementById("dueTime");
const remindSel = document.getElementById("remindBefore");
const colorInput = document.getElementById("listColor");
const prioritySel = document.getElementById("priority");

const totalEl = document.getElementById("total");
const completeEl = document.getElementById("complete");
const pendingEl = document.getElementById("pending");
const ctx = document.getElementById("statdiagramm");

const imgInput = document.getElementById("images");
const imgPreview = document.getElementById("imagePreview");

const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const themeToggle = document.getElementById("themeToggle");
const pdfBtn = document.getElementById("pdfBtn");

const templateSelect = document.getElementById("templateSelect");
const applyTemplate = document.getElementById("applyTemplate");

let currentSubtasks = [];
let currentImages = [];
let editingIndex = null;

initChart(ctx);

// theme restore
const THEME_KEY = "theme";

function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    if (themeToggle) themeToggle.checked = (t === "light");
}
applyTheme(localStorage.getItem(THEME_KEY) || "dark");
if (themeToggle) themeToggle.addEventListener("change", () => {
    const t = themeToggle.checked ? "light" : "dark";
    localStorage.setItem(THEME_KEY, t);
    applyTheme(t);
});

// reminders
function getTodos() { return withExpandedDefault(load()); }

function setTodos(next) { save(next); }
const reminders = initReminders({ getTodos, setTodos });

// stats
function updateStats() {
    const todos = load();
    const stats = countSubtasks(todos);
    if (totalEl) totalEl.textContent = stats.totalTasks;
    if (completeEl) completeEl.textContent = stats.completed;
    if (pendingEl) pendingEl.textContent = stats.pending;
    updateChart(stats);
}

// editing
function setEditing(i) {
    editingIndex = i;
    draw();
}

// build a bucket block
function bucketBlock(title) {
    const wrap = document.createElement("div");
    wrap.className = "bucket";
    const h = document.createElement("div");
    h.className = "bucket-title";
    h.textContent = title;
    const ul = document.createElement("ul");
    ul.className = "bucket-list";
    wrap.appendChild(h);
    wrap.appendChild(ul);
    return { wrap, ul };
}

function draw() {
    const all = withExpandedDefault(load());
    const visible = sortTodos(all.filter(isVisible));

    // partition to buckets
    const buckets = {
        today: [],
        week: [],
        later: [],
        undated: []
    };
    visible.forEach(t => { buckets[bucketOf(t)].push(t); });

    listRoot.innerHTML = "";

    function renderBucket(arr, title) {
        if (!arr.length) return;
        const { wrap, ul } = bucketBlock(title);
        listRoot.appendChild(wrap);

        arr.forEach((t) => {
            const storageIndex = all.findIndex(x => x.id === t.id);
            const inEdit = (editingIndex !== null && all[editingIndex] && all[editingIndex].id === t.id);
            const node = inEdit ?
                renderEditItem(t, storageIndex, { updateStats, setEditing }) :
                renderReadItem(t, storageIndex, { updateStats, setEditing });

            ul.appendChild(node);

            // enable subtask DnD inside this item (optional, works in read mode)
            const subUL = node.querySelector("ul");
            if (subUL) enableSubtaskDnD({
                ulEl: subUL,
                todoIndex: storageIndex,
                onAfter: () => { updateStats(); }
            });
        });

        // enable list DnD within this bucket
        enableListDnD({
            listEl: ul,
            onAfterReorder: () => { draw(); }
        });
    }

    renderBucket(buckets.today, "Heute");
    renderBucket(buckets.week, "Diese Woche");
    renderBucket(buckets.later, "Später");
    renderBucket(buckets.undated, "Ohne Datum");

    updateStats();
    if (reminders && reminders.refresh) reminders.refresh();
}

// subtasks buffer
if (addSubtaskBtn) {
    addSubtaskBtn.onclick = () => {
        const text = (subtaskInput.value || "").trim();
        if (!text) return;
        currentSubtasks.push({ text, done: false });

        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = text;
        const del = document.createElement("button");
        del.textContent = "×";
        del.onclick = () => {
            li.remove();
            currentSubtasks = currentSubtasks.filter(t => t !== text && t.text !== text);
        };
        li.appendChild(span);
        li.appendChild(del);
        subtaskList.appendChild(li);
        subtaskInput.value = "";
    };
}

// images buffer
if (imgInput) {
    imgInput.addEventListener("change", async(e) => {
        const files = Array.prototype.slice.call(e.target.files, 0, 12);
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (!f.type || f.type.indexOf("image/") !== 0) continue;
            const data = await fileToDataURL(f);
            currentImages.push(data);
            if (imgPreview) addThumb(
                imgPreview,
                data,
                (url) => { currentImages = currentImages.filter(u => u !== url); },
                (url) => openLightbox(url)
            );
        }
        imgInput.value = "";
    });
}

// templates
if (applyTemplate) {
    applyTemplate.onclick = () => {
        const id = templateSelect && templateSelect.value;
        if (!id) return;
        const tpl = getTemplate(id);
        if (!tpl) return;

        // fill title
        if (tpl.title) titleInput.value = tpl.title;

        // clear current buffer
        subtaskList.innerHTML = "";
        currentSubtasks = [];

        // add tasks
        (tpl.tasks || []).forEach(txt => {
            currentSubtasks.push({ text: txt, done: false });
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = txt;
            const del = document.createElement("button");
            del.textContent = "×";
            del.onclick = () => {
                li.remove();
                currentSubtasks = currentSubtasks.filter(t => t.text !== txt);
            };
            li.appendChild(span);
            li.appendChild(del);
            subtaskList.appendChild(li);
        });
    };
}

// create todo
if (addBtn) {
    addBtn.onclick = () => {
        const title = (titleInput.value || "").trim();
        if (!title || currentSubtasks.length === 0) return;

        const dueAt = toDueTimestamp(dateInput && dateInput.value, timeInput && timeInput.value);
        const remindMins = remindSel && remindSel.value ? Number(remindSel.value) : 0;
        const listColor = colorInput && colorInput.value ? colorInput.value : null;
        const priority = prioritySel && prioritySel.value ? prioritySel.value : "medium";

        const todos = withExpandedDefault(load());
        todos.unshift({
            id: Math.random().toString(36).slice(2),
            title,
            tasks: currentSubtasks,
            images: currentImages,
            expanded: true,
            dueAt: (typeof dueAt === "number") ? dueAt : undefined,
            remindMins: remindMins || undefined,
            color: listColor || undefined,
            priority: priority,
            lastNotified: 0,
            snoozeUntil: 0
        });
        save(todos);

        titleInput.value = "";
        subtaskList.innerHTML = "";
        currentSubtasks = [];
        if (imgPreview) imgPreview.innerHTML = "";
        currentImages = [];
        if (dateInput) dateInput.value = "";
        if (timeInput) timeInput.value = "";
        if (remindSel) remindSel.value = "";
        if (colorInput) colorInput.value = "#2c2f31";
        if (prioritySel) prioritySel.value = "medium";

        draw();
        updateStats();
    };
}

// export/import/pdf
if (exportBtn) exportBtn.addEventListener("click", exportTodos);
if (importInput) {
    importInput.addEventListener("change", (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        importTodosFromFile(f, (ok) => {
            if (ok) {
                draw();
                updateStats();
            }
            importInput.value = "";
        });
    });
}
if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
        pdfBtn.addEventListener("click", () => exportListsToPDF("ToDoWeb", "Martin"));
    });
}

// init
draw();
updateStats();