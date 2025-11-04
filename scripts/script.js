document.addEventListener("DOMContentLoaded", () => {
    const titleInput = document.getElementById("title");
    const subtaskInput = document.getElementById("subtask");
    const addSubtaskBtn = document.getElementById("addSubtask");
    const subtaskList = document.getElementById("subtaskList");
    const addBtn = document.getElementById("add");
    const list = document.getElementById("list");
  
    const totalEl = document.getElementById("total");
    const completeEl = document.getElementById("complete");
    const pendingEl = document.getElementById("pending");
    const ctx = document.getElementById("statdiagramm");
  
    const KEY = "todo";
    let currentSubtasks = [];
  
    function load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch { return []; }
    }
    function save(todos) { localStorage.setItem(KEY, JSON.stringify(todos)); }
  

    const statChart = new Chart(ctx, {
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
  
    function countSubtasks(todos) {
      let totalTasks = 0, completed = 0;
      for (const t of todos) {
        for (const task of (t.tasks || [])) {
          totalTasks++;
          if (task.done) completed++;
        }
      }
      return { totalTasks, completed, pending: totalTasks - completed };
    }
  
    function updateStats() {
      const todos = load();
      const { totalTasks, completed, pending } = countSubtasks(todos);
  
      totalEl.textContent = totalTasks;
      completeEl.textContent = completed;
      pendingEl.textContent = pending;
  
      statChart.data.datasets[0].data = [totalTasks, completed, pending];
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
  
        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        titleDiv.textContent = t.title;
        li.appendChild(titleDiv);
  
        const subList = document.createElement("ul");
        subList.style.listStyle = "none";
        subList.style.paddingLeft = "10px";
        subList.style.marginTop = "8px";
  
        (t.tasks || []).forEach((task, j) => {
          const subLi = document.createElement("li");
          subLi.style.display = "flex";
          subLi.style.alignItems = "center";
          subLi.style.gap = "8px";
          subLi.style.margin = "6px 0";
  
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = task.done;
          checkbox.onchange = () => {
            const arr = load();
            arr[i].tasks[j].done = checkbox.checked;
            save(arr);
    
            label.style.textDecoration = checkbox.checked ? "line-through" : "none";
            updateStats();
          };
  
          const label = document.createElement("span");
          label.textContent = task.text;
          if (task.done) label.style.textDecoration = "line-through";
  
          subLi.appendChild(checkbox);
          subLi.appendChild(label);
          subList.appendChild(subLi);
        });
  
        li.appendChild(subList);
  
        const del = document.createElement("button");
        del.className = "delete";
        del.textContent = "×";
        del.onclick = () => {
          const arr = load();
          arr.splice(i, 1);
          save(arr);
          draw();
          updateStats();
        };
        li.appendChild(del);
  
        list.appendChild(li);
      });
  
      updateStats();
    }
  
    if (addSubtaskBtn) {
      addSubtaskBtn.onclick = () => {
        const text = subtaskInput.value.trim();
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

    if (addBtn) {
      addBtn.onclick = () => {
        const title = titleInput.value.trim();
        if (!title || currentSubtasks.length === 0) return;
  
        const todos = load();
        todos.unshift({ title, tasks: currentSubtasks });
        save(todos);
  
        titleInput.value = "";
        subtaskList.innerHTML = "";
        currentSubtasks = [];
  
        draw();
        updateStats();
      };
    }
  
    draw();
    updateStats();
  });
  