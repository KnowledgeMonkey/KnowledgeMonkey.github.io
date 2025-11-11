// src/pdfExport.js
import { load } from "./data.js";

// ---- Color palette (dark enterprise) ----
const C = {
    pageBg: [17, 19, 21], // #111315
    surface: [27, 31, 35], // #1b1f23
    border: [45, 51, 59], // #2d333b
    text: [230, 232, 236], // near-white
    muted: [158, 166, 176],
    accent: [138, 180, 248], // #8ab4f8
    success: [126, 224, 129], // #7ee081
    warn: [232, 178, 106], // #e8b26a
    error: [242, 139, 130], // #f28b82
    track: [70, 76, 85]
};

function setFill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }

function setStroke(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

function setText(doc, rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }

function header(doc, brand, author, margin) {
    const w = doc.internal.pageSize.getWidth();
    // Brand
    setText(doc, C.accent);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`${brand}`, margin, margin + 8);
    // Subtitle
    setText(doc, C.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`erstellt von ${author}`, margin, margin + 26);

    // Thin divider
    setStroke(doc, C.border);
    doc.setLineWidth(0.8);
    doc.line(margin, margin + 36, w - margin, margin + 36);
}

function footer(doc, pageNum, margin) {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    setStroke(doc, C.border);
    doc.setLineWidth(0.6);
    doc.line(margin, h - margin - 20, w - margin, h - margin - 20);

    setText(doc, C.muted);
    doc.setFontSize(10);
    const date = new Date().toLocaleString();
    doc.text(`Seite ${pageNum}`, margin, h - margin - 6);
    doc.text(date, w - margin, h - margin - 6, { align: "right" });
}

function newPage(doc, pageNumRef, brand, author, margin) {
    doc.addPage();
    // page background
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    setFill(doc, C.pageBg);
    doc.rect(0, 0, w, h, "F");
    header(doc, brand, author, margin);
    pageNumRef.value += 1;
    footer(doc, pageNumRef.value, margin);
}

function drawProgressBar(doc, x, y, w, h, pct) {
    // track
    setFill(doc, C.track);
    doc.roundedRect(x, y, w, h, 4, 4, "F");
    // fill
    setFill(doc, C.success);
    const fw = Math.max(0, Math.min(w, Math.round((pct / 100) * w)));
    doc.roundedRect(x, y, fw, h, 4, 4, "F");
}

function dueBadge(doc, x, y, text, toneRGB) {
    const padX = 6,
        padY = 3;
    doc.setFontSize(9);
    const w = doc.getTextWidth(text) + padX * 2;
    const h = 14;
    setFill(doc, toneRGB);
    doc.roundedRect(x, y, w, h, 6, 6, "F");
    setText(doc, [16, 17, 19]); // dark text on light badge
    doc.text(text, x + padX, y + 10);
}

function formatDue(t) {
    if (typeof t.dueAt !== "number") return null;
    const now = Date.now(),
        diff = t.dueAt - now;
    const d = new Date(t.dueAt);
    const nice = d.toLocaleString();
    if (diff < 0) return { text: `überfällig – ${nice}`, tone: C.error };
    if (diff < 3 * 3600 * 1000) return { text: `bald fällig – ${nice}`, tone: C.warn };
    return { text: `fällig – ${nice}`, tone: C.accent };
}

export async function exportListsToPDF(brand = "ToDoWeb", author = "Martin") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentW = w - margin * 2;

    // full-page dark background
    setFill(doc, C.pageBg);
    doc.rect(0, 0, w, h, "F");

    // header + footer
    let pageNum = { value: 1 };
    header(doc, brand, author, margin);
    footer(doc, pageNum.value, margin);

    // content start y
    let y = margin + 56;

    const todos = load();

    doc.setFont("helvetica", "normal");

    for (const t of todos) {
        const tasks = Array.isArray(t.tasks) ? t.tasks : [];
        const done = tasks.filter(v => v && v.done).length;
        const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

        // Estimate card height to decide page break
        const estHeight = 28 /*title*/ + 18 /*progress*/ + 12 /*gap*/ + tasks.length * 16 + 28 /*padding*/ ;
        if (y + estHeight > h - margin - 28) {
            newPage(doc, pageNum, brand, author, margin);
            y = margin + 56;
        }

        // Card
        const cardX = margin;
        const cardY = y;
        const cardW = contentW;
        const cardH = Math.min(estHeight, h - margin - 40 - y); // safety

        // surface
        setFill(doc, C.surface);
        setStroke(doc, C.border);
        doc.setLineWidth(1);
        doc.roundedRect(cardX, cardY, cardW, cardH, 10, 10, "FD");

        // color bar (list color) on left
        const color = t.color || "#8ab4f8";
        doc.setFillColor(color);
        doc.roundedRect(cardX, cardY, 6, cardH, 10, 10, "F");

        // Title
        setText(doc, C.accent);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(t.title || "Unbenannte Liste", cardX + 16, cardY + 22);

        // Due badge (top-right)
        const due = formatDue(t);
        if (due) {
            dueBadge(doc, cardX + cardW - 180, cardY + 10, due.text, [255, 255, 255]);
            // draw small left stripe with tone
            setFill(doc, due.tone);
            doc.rect(cardX + cardW - 184, cardY + 12, 3, 10, "F");
        }

        // Progress bar + label
        drawProgressBar(doc, cardX + 16, cardY + 30, cardW - 32, 10, pct);
        setText(doc, C.muted);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${done}/${tasks.length} erledigt (${pct}%)`, cardX + 16, cardY + 52);

        // Subtasks
        setText(doc, C.text);
        doc.setFontSize(11);

        let rowY = cardY + 72;
        for (const sub of tasks) {
            if (rowY > h - margin - 24) {
                newPage(doc, pageNum, brand, author, margin);
                // re-draw card header context (optional), or just continue as plain rows:
                rowY = margin + 20;
            }
            // checkbox
            setStroke(doc, C.border);
            doc.setLineWidth(1);
            doc.rect(cardX + 16, rowY - 8, 10, 10);
            if (sub.done) {
                setStroke(doc, C.success);
                doc.setLineWidth(2);
                doc.line(cardX + 18, rowY - 4, cardX + 22, rowY + 2);
                doc.line(cardX + 22, rowY + 2, cardX + 28, rowY - 6);
            }
            // text
            setText(doc, sub.done ? C.muted : C.text);
            const text = (sub && sub.text) ? sub.text : "";
            doc.text(text, cardX + 32, rowY);
            rowY += 16;
        }

        y = cardY + Math.max(96, rowY - cardY) + 14; // gap after card
    }

    doc.save("ToDo-Listen.pdf");
}