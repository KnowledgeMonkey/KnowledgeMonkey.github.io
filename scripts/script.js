document.addEventListener("DOMContentLoaded", () => {
    const title1 = document.getElementById("title");
    const details = document.getElementById("details");
    const addBtn = document.getElementById("add");
    const list = document.getElementById("list");
    const totalEl = document.getElementById("total");
    const completeEl = document.getElementById("complete");
    const pendingEl = document.getElementById("pending");
    const ctx = document.getElementById("statdiagramm");
    const KEY = "todo";
  
    function load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch { return []; }
    }
  
    function save(todos) {
      localStorage.setItem(KEY, JSON.stringify(todos));
    }
  
    const statChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Insgesamt", "Abgeschlossen", "Ausstehend"],
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
          maintainAspectRatio: true,
          layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
          plugins: {
            legend: { position: "bottom", labels: { color: "#f2f2f2" } }
          }
        }
      });
      ;
  
    function updateStats() {
      const todos = load();
      const total = todos.length;
      const completed = todos.filter(t => t.done).length;
      const pending = total - completed;
      totalEl.textContent = total;
      completeEl.textContent = completed;
      pendingEl.textContent = pending;
      statChart.data.datasets[0].data = [total, completed, pending];
      statChart.update();
    }
  
    function draw() {
      const todos = load();
      list.innerHTML = "";
      if (todos.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Noch keine ToDos";
        list.appendChild(li);
        updateStats();
        return;
      }
      todos.forEach((t, i) => {
        const li = document.createElement("li");
        if (t.done) li.classList.add("done");
        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.textContent = t.title;
        li.appendChild(titleDiv);
        if (t.details) {
          const det = document.createElement("div");
          det.className = "details";
          det.textContent = t.details;
          li.appendChild(det);
        }
        const toggle = document.createElement("button");
        toggle.className = "toggle";
        toggle.textContent = "✓";
        toggle.onclick = () => {
          const arr = load();
          arr[i].done = !arr[i].done;
          save(arr);
          draw();
        };
        li.appendChild(toggle);
        const del = document.createElement("button");
        del.className = "delete";
        del.textContent = "×";
        del.onclick = () => {
          const arr = load();
          arr.splice(i, 1);
          save(arr);
          draw();
        };
        li.appendChild(del);
        list.appendChild(li);
      });
      updateStats();
    }
  
    addBtn.onclick = () => {
      const title = title1.value.trim();
      const detail = details.value.trim();
      if (!title) return;
      const todos = load();
      todos.unshift({ title, details: detail, done: false });
      save(todos);
      title1.value = "";
      details.value = "";
      draw();
    };
  
    draw();
  });
  