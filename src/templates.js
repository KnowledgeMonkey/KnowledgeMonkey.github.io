// src/templates.js
export function getTemplate(id) {
    if (id === "household") {
        return {
            title: "Haushalt",
            tasks: [
                "Wäsche waschen",
                "Trockner anschalten",
                "Küche wischen",
                "Müll rausbringen"
            ]
        };
    }
    if (id === "grocery") {
        return {
            title: "Einkauf",
            tasks: [
                "Milch",
                "Eier",
                "Brot",
                "Gemüse"
            ]
        };
    }
    if (id === "study") {
        return {
            title: "Lernen",
            tasks: [
                "Zusammenfassung Kapitel 1",
                "Karteikarten",
                "Übungsaufgaben 1-10"
            ]
        };
    }
    if (id === "project") {
        return {
            title: "Projekt",
            tasks: [
                "Setup Repo",
                "Grundstruktur",
                "Erste Komponente",
                "Review"
            ]
        };
    }
    return null;
}