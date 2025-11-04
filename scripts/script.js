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
    let editingIndex = null;
  
    function load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch { return []; }
    }
    function save(todos) { localStorage.setItem(KEY, JSON.stringify(todos)); }
  
    const statChart = ctx ? new Chart(ctx, {
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
    }) : null;
  
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
      if (totalEl) totalEl.textContent = totalTasks;
      if (completeEl) completeEl.textContent = completed;
      if (pendingEl) pendingEl.textContent = pending;
      if (statChart) {
        statChart.data.datasets[0].data = [totalTasks, completed, pending];
        statChart.update();
      }
    }
  
    function renderReadItem(t, i) {
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
          subText.style.textDecoration = checkbox.checked ? "line-through" : "none";
          updateStats();
        };
  
        const subText = document.createElement("span");
        subText.textContent = task.text;
        if (task.done) subText.style.textDecoration = "line-through";
  
        subLi.appendChild(checkbox);
        subLi.appendChild(subText);
        subList.appendChild(subLi);
      });
  
      li.appendChild(subList);
  
      const actions = document.createElement("div");
      actions.className = "item-actions";
  
      const editBtn = document.createElement("button");
      editBtn.className = "edit";
      editBtn.textContent = "";
      editBtn.onclick = () => { editingIndex = i; draw(); };
  
      const del = document.createElement("button");
      del.className = "delete";
      del.textContent = "×";
      del.onclick = () => {
        const arr = load();
        arr.splice(i, 1);
        save(arr);
        if (editingIndex === i) editingIndex = null;
        draw();
        updateStats();
      };
  
      actions.appendChild(editBtn);
      actions.appendChild(del);
      li.appendChild(actions);
  
      return li;
    }
  
    function renderEditItem(t, i) {
      const li = document.createElement("li");
      li.classList.add("editing");
  
      const titleInput = document.createElement("input");
      titleInput.className = "edit-title";
      titleInput.type = "text";
      titleInput.value = t.title;
  
      const subList = document.createElement("ul");
      subList.className = "edit-subtasks";
  
      (t.tasks || []).forEach((task, j) => {
        const subLi = document.createElement("li");
        subLi.className = "edit-subtask-row";
  
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = task.done;
  
        const txt = document.createElement("input");
        txt.type = "text";
        txt.value = task.text;
        txt.className = "edit-subtask";
  
        const rm = document.createElement("button");
        rm.className = "mini danger";
        rm.textContent = "×";
        rm.onclick = () => { subLi.remove(); };
  
        subLi.appendChild(cb);
        subLi.appendChild(txt);
        subLi.appendChild(rm);
        subList.appendChild(subLi);
      });
  
      const addRow = document.createElement("div");
      addRow.className = "edit-addrow";
  
      const newTxt = document.createElement("input");
      newTxt.type = "text";
      newTxt.placeholder = "Neue Unteraufgabe";
  
      const addRowBtn = document.createElement("button");
      addRowBtn.className = "mini";
      addRowBtn.textContent = "+";
      addRowBtn.onclick = () => {
        const val = newTxt.value.trim();
        if (!val) return;
        const subLi = document.createElement("li");
        subLi.className = "edit-subtask-row";
  
        const cb = document.createElement("input");
        cb.type = "checkbox";
  
        const txt = document.createElement("input");
        txt.type = "text";
        txt.value = val;
        txt.className = "edit-subtask";
  
        const rm = document.createElement("button");
        rm.className = "mini danger";
        rm.textContent = "×";
        rm.onclick = () => { subLi.remove(); };
  
        subLi.appendChild(cb);
        subLi.appendChild(txt);
        subLi.appendChild(rm);
        subList.appendChild(subLi);
        newTxt.value = "";
      };
  
      addRow.appendChild(newTxt);
      addRow.appendChild(addRowBtn);
  
      const actions = document.createElement("div");
      actions.className = "edit-actions";
  
      const saveBtn = document.createElement("button");
      saveBtn.className = "primary";
      saveBtn.textContent = "Speichern";
      saveBtn.onclick = () => {
        const updatedTitle = titleInput.value.trim();
        const rows = subList.querySelectorAll(".edit-subtask-row");
        const tasks = [];
        rows.forEach(row => {
          const txt = row.querySelector('input[type="text"]').value.trim();
          const done = row.querySelector('input[type="checkbox"]').checked;
          if (txt) tasks.push({ text: txt, done });
        });
        const arr = load();
        arr[i] = { title: updatedTitle || t.title, tasks };
        save(arr);
        editingIndex = null;
        draw();
        updateStats();
      };
  
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Abbrechen";
      cancelBtn.onclick = () => { editingIndex = null; draw(); };
  
      actions.appendChild(saveBtn);
      actions.appendChild(cancelBtn);
  
      li.appendChild(titleInput);
      li.appendChild(subList);
      li.appendChild(addRow);
      li.appendChild(actions);
  
      return li;
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
        if (editingIndex === i) {
          list.appendChild(renderEditItem(t, i));
        } else {
          list.appendChild(renderReadItem(t, i));
        }
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
  