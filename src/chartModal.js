let modalEl, chart, currentType = "doughnut";

function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement("div");
    modalEl.className = "chart-modal hidden";
    modalEl.innerHTML = '' +
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

    var closeBtn = modalEl.querySelector(".chart-modal__close");
    var backdrop = modalEl.querySelector(".chart-modal__backdrop");
    var close = function() {
        modalEl.classList.add("hidden");
        if (chart) { chart.destroy();
            chart = null; }
    };
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    var typeButtons = modalEl.querySelectorAll(".chart-type");
    for (var k = 0; k < typeButtons.length; k++) {
        (function(btn) {
            btn.addEventListener("click", function() {
                currentType = btn.getAttribute("data-type");
                for (var m = 0; m < typeButtons.length; m++) {
                    typeButtons[m].classList.remove("active");
                }
                btn.classList.add("active");
                if (modalEl._lastCounts) renderChartFromCounts(modalEl._lastCounts);
            });
        })(typeButtons[k]);
    }
}

function computeCountsFromTodo(todo) {
    var t = todo || {};
    var tasks = t.tasks || [];
    var completed = 0;
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i] && tasks[i].done) completed++;
    }
    var total = tasks.length;
    return { title: t.title || "ToDo", completed: completed, pending: total - completed };
}

function ensureCanvas() {
    var wrap = modalEl.querySelector(".chart-modal__canvas-wrap");
    wrap.innerHTML = '<canvas id="todoChart"></canvas>';
    return modalEl.querySelector("#todoChart");
}

function renderChartFromCounts(obj) {
    var title = obj.title;
    var completed = obj.completed;
    var pending = obj.pending;

    var isBar = currentType === "bar";
    var ctx = ensureCanvas();
    if (chart) { chart.destroy();
        chart = null; }

    if ((completed + pending) === 0) {
        var wrap = modalEl.querySelector(".chart-modal__canvas-wrap");
        wrap.innerHTML = '<div class="chart-modal__empty">Keine Unteraufgaben vorhanden.</div>';
        return;
    }

    chart = new Chart(ctx, {
        type: currentType,
        data: {
            labels: ["Fertig", "Ausstehend"],
            datasets: [{
                label: "Aufgaben",
                data: [completed, pending],
                backgroundColor: ["#7ee081", "#e08a7e"],
                borderWidth: 1
            }]
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
}

export function openChartModal(todo) {
    ensureModal();
    var counts = computeCountsFromTodo(todo);
    modalEl._lastCounts = counts;
    modalEl.classList.remove("hidden");
    modalEl.querySelector(".chart-modal__title").textContent = "Diagramm – " + counts.title;

    var typeButtons = modalEl.querySelectorAll(".chart-type");
    for (var i = 0; i < typeButtons.length; i++) {
        var b = typeButtons[i];
        var active = b.getAttribute("data-type") === currentType;
        if (active) b.classList.add("active");
        else b.classList.remove("active");
    }

    renderChartFromCounts(counts);
}

export function updateChartModalFromCounts(payload) {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    var title = (payload && payload.title) ? payload.title : "ToDo";
    var completed = payload && typeof payload.completed === "number" ? payload.completed : 0;
    var pending = payload && typeof payload.pending === "number" ? payload.pending : 0;
    modalEl._lastCounts = { title: title, completed: completed, pending: pending };
    modalEl.querySelector(".chart-modal__title").textContent = "Diagramm – " + title;
    renderChartFromCounts(modalEl._lastCounts);
}

export function updateChartModal(todo) {
    if (!modalEl || modalEl.classList.contains("hidden")) return;
    var counts = computeCountsFromTodo(todo);
    updateChartModalFromCounts(counts);
}