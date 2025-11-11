let chart = null;

export function initChart(canvas) {
    if (!canvas) return null;
    chart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Gesamt-Aufgaben", "Erledigt", "Ausstehend"],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ["#8ab4f8", "#7ee081", "#e08a7e"],
                borderWidth: 1,
                radius: "88%",
                cutout: "60%"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 10 },
            plugins: {
                legend: { position: "bottom", labels: { color: "#f2f2f2" } }
            }
        }
    });
    return chart;
}

export function updateChart({ totalTasks, completed, pending }) {
    if (!chart) return;
    chart.data.datasets[0].data = [totalTasks, completed, pending];
    chart.update();
}