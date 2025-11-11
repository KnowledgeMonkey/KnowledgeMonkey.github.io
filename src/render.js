import { load, save } from "./data.js";
import { addThumb, openLightbox, fileToDataURL } from "./images.js";
import { openChartModal, updateChartModalFromCounts } from "./chartModal.js";

function dueMeta(t) {
    if (typeof t.dueAt !== "number") return null;
    var now = Date.now();
    var diff = t.dueAt - now;
    var mins = Math.round(diff / 60000);
    var abs = Math.abs(mins);
    var label;
    if (abs >= 1440) label = Math.round(abs / 1440) + " Tage";
    else if (abs >= 60) label = Math.round(abs / 60) + " Std";
    else label = abs + " Min";
    var cls = mins < 0 ? "overdue" : (mins <= 180 ? "soon" : "later");
    var text = mins < 0 ? ("Überfällig seit " + label) : ("Fällig in " + label);
    return { cls: cls, text: text };
}

function progressOf(t) {
    var tasks = t.tasks || [];
    if (tasks.length === 0) return 0;
    var done = 0;
    for (var i = 0; i < tasks.length; i++)
        if (tasks[i] && tasks[i].done) done++;
    return Math.round((done / tasks.length) * 100);
}

function prioBadge(priority) {
    var span = document.createElement("span");
    span.className = "prio-badge " + (priority === "high" ? "prio-high" : priority === "low" ? "prio-low" : "prio-medium");
    span.textContent = (priority === "high" ? "Hoch" : priority === "low" ? "Niedrig" : "Mittel");
    return span;
}

export function renderReadItem(t, storageIndex, { setEditing, updateStats }) {
    var li = document.createElement("li");
    li.setAttribute("data-id", t.id);
    li.draggable = true;
    li.classList.add(t.expanded === false ? "collapsed" : "expanded");
    li.style.border = t.color ? ("2px solid " + t.color) : "1px solid #3a3d3f";

    var foldBtn = document.createElement("button");
    foldBtn.className = "fold";
    foldBtn.title = t.expanded === false ? "Aufklappen" : "Zuklappen";
    foldBtn.onclick = function() {
        var arr = load();
        arr[storageIndex].expanded = !(arr[storageIndex].expanded === false ? false : true);
        save(arr);
        setEditing(null);
    };
    li.appendChild(foldBtn);

    var titleDiv = document.createElement("div");
    titleDiv.className = "title";
    titleDiv.textContent = t.title;
    li.appendChild(titleDiv);

    var dragIcon = document.createElement("div");
    dragIcon.className = "drag-handle";
    dragIcon.textContent = "⠿";
    li.appendChild(dragIcon);

    var progWrap = document.createElement("div");
    progWrap.className = "progress-wrap";
    var prog = document.createElement("div");
    prog.className = "progress";
    var p = progressOf(t);
    prog.style.setProperty("--p", (p / 100).toString());
    prog.textContent = p + "%";
    progWrap.appendChild(prog);
    li.appendChild(progWrap);

    var meta = document.createElement("div");
    meta.className = "meta";
    var m = dueMeta(t);
    if (m) {
        var badge = document.createElement("span");
        badge.className = "due-badge " + m.cls;
        badge.textContent = m.text;
        meta.appendChild(badge);
    }
    if (t.priority) meta.appendChild(prioBadge(t.priority));

    var snooze = document.createElement("button");
    snooze.className = "snooze";
    snooze.textContent = "Snooze";
    snooze.onclick = function() {
        var mins = prompt("Snoozen (Minuten): z.B. 30, 60, 180, 1440");
        var v = Number(mins);
        if (!v) return;
        var arr = load();
        var until = Date.now() + v * 60000;
        arr[storageIndex].snoozeUntil = until;
        save(arr);
        setEditing(null); // redraw via main
    };
    meta.appendChild(snooze);

    li.appendChild(meta);

    var body = document.createElement("div");
    body.className = "item-body";

    var subList = document.createElement("ul");
    subList.style.listStyle = "none";
    subList.style.paddingLeft = "10px";
    subList.style.marginTop = "8px";

    var tasks = t.tasks || [];
    for (var j = 0; j < tasks.length; j++) {
        (function(jIdx) {
            var task = tasks[jIdx];

            var subLi = document.createElement("li");
            subLi.style.display = "flex";
            subLi.style.alignItems = "center";
            subLi.style.gap = "8px";
            subLi.style.margin = "6px 0";
            subLi.setAttribute("data-subindex", jIdx);
            subLi.draggable = true;

            var handle = document.createElement("span");
            handle.className = "subtask-handle";
            handle.textContent = "⋮⋮";

            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !!task.done;

            var subText = document.createElement("span");
            subText.textContent = task.text;
            if (task.done) subText.style.textDecoration = "line-through";

            checkbox.onchange = function() {
                var arr = load();
                arr[storageIndex].tasks[jIdx].done = checkbox.checked;
                save(arr);
                subText.style.textDecoration = checkbox.checked ? "line-through" : "none";
                updateStats();

                var nowTasks = arr[storageIndex].tasks || [];
                var completed = 0;
                for (var k = 0; k < nowTasks.length; k++)
                    if (nowTasks[k] && nowTasks[k].done) completed++;
                var pending = nowTasks.length - completed;
                updateChartModalFromCounts({ title: arr[storageIndex].title, completed: completed, pending: pending });

                var pnew = nowTasks.length ? Math.round((completed / nowTasks.length) * 100) : 0;
                prog.style.setProperty("--p", (pnew / 100).toString());
                prog.textContent = pnew + "%";
            };

            subLi.appendChild(handle);
            subLi.appendChild(checkbox);
            subLi.appendChild(subText);
            subList.appendChild(subLi);
        })(j);
    }

    body.appendChild(subList);

    if (t.images && t.images.length) {
        var gal = document.createElement("div");
        gal.className = "gallery";
        for (var g = 0; g < t.images.length; g++) {
            (function(url) {
                addThumb(gal, url, null, function(u) { openLightbox(u); });
            })(t.images[g]);
        }
        body.appendChild(gal);
    }

    li.appendChild(body);

    var actions = document.createElement("div");
    actions.className = "item-actions";

    var editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.title = "Bearbeiten";
    editBtn.textContent = "";
    editBtn.onclick = function() { setEditing(storageIndex); };

    var chartBtn = document.createElement("button");
    chartBtn.className = "chartbtn";
    chartBtn.title = "Diagramm anzeigen";
    chartBtn.onclick = function() { openChartModal(t); };

    var del = document.createElement("button");
    del.className = "delete";
    del.title = "Löschen";
    del.textContent = "×";
    del.onclick = function() {
        var arr = load();
        arr.splice(storageIndex, 1);
        save(arr);
        setEditing(null);
        updateStats();
    };

    actions.appendChild(editBtn);
    actions.appendChild(chartBtn);
    actions.appendChild(del);
    li.appendChild(actions);

    return li;
}


export function renderEditItem(t, i, { updateStats, setEditing }) {
    var li = document.createElement("li");
    li.classList.add("editing");
    li.style.border = t.color ? ("2px solid " + t.color) : "1px solid #3a3d3f";

    var titleInputEdit = document.createElement("input");
    titleInputEdit.className = "edit-title";
    titleInputEdit.type = "text";
    titleInputEdit.value = t.title;

    var subList = document.createElement("ul");
    subList.className = "edit-subtasks";

    var tasks = t.tasks || [];
    for (var n = 0; n < tasks.length; n++) {
        (function(task) {
            var subLi = document.createElement("li");
            subLi.className = "edit-subtask-row";

            var cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!task.done;

            var txt = document.createElement("input");
            txt.type = "text";
            txt.value = task.text;
            txt.className = "edit-subtask";

            var rm = document.createElement("button");
            rm.className = "mini danger";
            rm.textContent = "×";
            rm.onclick = function() { subLi.remove(); };

            subLi.appendChild(cb);
            subLi.appendChild(txt);
            subLi.appendChild(rm);
            subList.appendChild(subLi);
        })(tasks[n]);
    }

    var addRow = document.createElement("div");
    addRow.className = "edit-addrow";

    var newTxt = document.createElement("input");
    newTxt.type = "text";
    newTxt.placeholder = "Neue Unteraufgabe";

    var addRowBtn = document.createElement("button");
    addRowBtn.className = "mini";
    addRowBtn.textContent = "+";
    addRowBtn.onclick = function() {
        var val = (newTxt.value || "").trim();
        if (!val) return;
        var subLi = document.createElement("li");
        subLi.className = "edit-subtask-row";

        var cb = document.createElement("input");
        cb.type = "checkbox";
        var txt = document.createElement("input");
        txt.type = "text";
        txt.value = val;
        txt.className = "edit-subtask";
        var rm = document.createElement("button");
        rm.className = "mini danger";
        rm.textContent = "×";
        rm.onclick = function() { subLi.remove(); };

        subLi.appendChild(cb);
        subLi.appendChild(txt);
        subLi.appendChild(rm);
        subList.appendChild(subLi);
        newTxt.value = "";
    };

    addRow.appendChild(newTxt);
    addRow.appendChild(addRowBtn);

    var imgRow = document.createElement("div");
    imgRow.className = "image-input";
    var addImg = document.createElement("input");
    addImg.type = "file";
    addImg.accept = "image/*";
    addImg.multiple = true;
    var editGal = document.createElement("div");
    editGal.className = "gallery";

    function renderEditGallery() {
        editGal.innerHTML = "";
        var imgs = t.images || [];
        for (var x = 0; x < imgs.length; x++) {
            (function(url, idx) {
                var th = document.createElement("div");
                th.className = "thumb";
                var im = new Image();
                im.src = url;
                th.appendChild(im);
                var rm = document.createElement("button");
                rm.className = "thumb-del";
                rm.textContent = "×";
                rm.onclick = function(e) {
                    e.stopPropagation();
                    t.images.splice(idx, 1);
                    renderEditGallery();
                };
                th.appendChild(rm);
                th.onclick = function() { openLightbox(url); };
                editGal.appendChild(th);
            })(imgs[x], x);
        }
    }
    renderEditGallery();

    addImg.onchange = async function(e) {
        var files = Array.prototype.slice.call(e.target.files || [], 0);
        for (var q = 0; q < files.length; q++) {
            var f = files[q];
            if (!f.type || f.type.indexOf("image/") !== 0) continue;
            var data = await fileToDataURL(f);
            if (!t.images) t.images = [];
            t.images.push(data);
        }
        renderEditGallery();
        addImg.value = "";
    };

    imgRow.appendChild(addImg);
    imgRow.appendChild(editGal);

    var actions = document.createElement("div");
    actions.className = "edit-actions";
    var saveBtn = document.createElement("button");
    saveBtn.className = "primary";
    saveBtn.textContent = "Speichern";
    saveBtn.onclick = function() {
        var updatedTitle = (titleInputEdit.value || "").trim() || t.title;

        var rows = subList.querySelectorAll(".edit-subtask-row");
        var newTasks = [];
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            var txt = row.querySelector('input[type="text"]').value.trim();
            var done = row.querySelector('input[type="checkbox"]').checked;
            if (txt) newTasks.push({ text: txt, done: done });
        }

        var arr = load();
        var prev = arr[i] || {};
        arr[i] = {
            id: prev.id,
            title: updatedTitle,
            tasks: newTasks,
            images: t.images || [],
            expanded: typeof prev.expanded === "boolean" ? prev.expanded : true,
            dueAt: typeof prev.dueAt === "number" ? prev.dueAt : undefined,
            remindMins: typeof prev.remindMins === "number" ? prev.remindMins : undefined,
            color: prev.color,
            priority: prev.priority || "medium",
            lastNotified: typeof prev.lastNotified === "number" ? prev.lastNotified : 0
        };
        save(arr);
        setEditing(null);
        updateStats();
    };
    var cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Abbrechen";
    cancelBtn.onclick = function() { setEditing(null); };

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    li.appendChild(titleInputEdit);
    li.appendChild(subList);
    li.appendChild(addRow);
    li.appendChild(imgRow);
    li.appendChild(actions);

    return li;
}