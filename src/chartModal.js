let modalEl, chart, currentType = "doughnut";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.className = "chart-modal hidden";
    modalEl.innerHTML =
        '<div class="chart-modal__backdrop"></div>' +
        '<div class="chart-modal__panel">' +
        '  <div class="chart-modal__header">' +
        '    <div class="chart-modal__title">Diagramm</div>' +
        '    <button class="chart-modal__close">×</button>' +
        '  </div>' +
        '  <div class="chart-modal__types">' +
        '    <button class="chart-type" data-type="doughnut">Doughnut</button>' +
        '    <button class="chart-type" data-type="pie">Pie</button>' +
        '    <button class="chart-type" data-type="bar">Balken</button>' +
        '  </div>' +
        '  <div class="chart-modal__canvas-wrap"><canvas id="todoChart"></canvas></div>' +
        '</div>';
    document.body.appendChild(modalEl);

    const close = () => { modalEl.classList.add("hidden"); if (chart) { chart.destroy();
            chart = null; } };
    $(".chart-modal__close", modalEl).addEventListener("click", close);
    $(".chart-modal__backdrop", modalEl).addEventListener("click", close);

    $(".chart-modal__types", modalEl).addEventListener("click", (e) => {
        const btn = e.target.closest(".chart-type");
        if (!btn) return;
        currentType = btn.getAttribute("data-type");
        setActiveTypeButtons();
        if (modalEl._lastCounts) renderChartFromCounts(modalEl._lastCounts);
    });
}

function computeCountsFromTodo(todo) {
    const t = todo || {};
    const tasks = t.tasks || [];
    const completed = tasks.reduce((a, x) => a + (x && x.done ? 1 : 0), 0);
    return { title: t.title || "ToDo", completed, pending: tasks.length - completed };
}

function ensureCanvas() {
    const wrap = $(".chart-modal__canvas-wrap", modalEl);
    wrap.innerHTML = '<canvas id="todoChart"></canvas>';
    return $("#todoChart", modalEl);
}

function setActiveTypeButtons() {
    $$(".chart-type", modalEl).forEach(b => {
        b.classList.toggle("active", b.getAttribute("data-type") === currentType);
    });
}

function renderChartFromCounts({ title, completed, pending }) {
    const total = completed + pending;
    const wrap = $(".chart-modal__canvas-wrap", modalEl);
    if (chart) { chart.destroy();
        chart = null; }

    if (!total) {
        wrap.innerHTML = '<div class="chart-modal__empty">Keine Unteraufgaben vorhanden.</div>';
        return;
    }

    const isBar = currentType === "bar";
    const ctx = ensureCanvas();

    chart = new Chart(ctx, {
        type: currentType,
        data: {
            labels: ["Fertig", "Ausstehend"],
            datasets: [{ label: "Aufgaben", data: [completed, pending], backgroundColor: ["#7ee081", "#e08a7e"], borderWidth: 1 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: !isBar, labels: { color: "#f2f2f2" } },
                tooltip: { enabled: true }
            },
            scales: isBar ? {
                x: { ticks: { color: "#f2f2f2" }, grid: { color: "rgba(255,255,255,.08)" } },
                y: { beginAtZero: true, ticks: { color: "#f2f2f2" }, grid: { color: "rgba(255,255,255,.08)" } }
            } : {}
        }
    });
    $(".chart-modal__title", modalEl).textContent = "Diagramm – " + title;
}

export function openChartModal(todo) {
    ensureModal();
    const counts = computeCountsFromTodo(todo);
    modalEl._lastCounts = counts;
    modalEl.classList.remove("hidden");
    setActiveTypeButtons();
    renderChartFromCounts(counts);
}

export function updateChartModalFromCounts(p = {}) {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    const payload = {
        title: p.title || "ToDo",
        completed: typeof p.completed === "number" ? p.completed : 0,
        pending: typeof p.pending === "number" ? p.pending : 0
    };
    modalEl._lastCounts = payload;
    renderChartFromCounts(payload);
}

export function updateChartModal(todo) {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    updateChartModalFromCounts(computeCountsFromTodo(todo));
}