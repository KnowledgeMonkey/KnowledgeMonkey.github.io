class ChordSVG {
    constructor(container) {
        this.container = container;
        this.svgNS = "http://www.w3.org/2000/svg";
    }

    createChordDiagram(chord) {
        const svg = document.createElementNS(this.svgNS, "svg");
        svg.setAttribute("width", "200");
        svg.setAttribute("height", "250");
        svg.setAttribute("viewBox", "0 0 200 250");
        svg.classList.add("chord-diagram");

        // Draw fretboard
        this.drawFretboard(svg);

        // Draw string labels
        const strings = ['E', 'A', 'D', 'G', 'B', 'e'];
        strings.forEach((label, index) => {
            this.drawStringLabel(svg, label, index);
        });

        // Parse and draw finger positions
        this.drawFingerPositions(svg, chord);

        return svg;
    }

    drawFretboard(svg) {
        const fretCount = 5;
        const stringCount = 6;
        const startX = 40;
        const startY = 40;
        const fretSpacing = 35;
        const stringSpacing = 20;

        // Draw strings
        for (let i = 0; i < stringCount; i++) {
            const x = startX + (i * stringSpacing);
            const line = document.createElementNS(this.svgNS, "line");
            line.setAttribute("x1", x);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", x);
            line.setAttribute("y2", startY + (fretCount * fretSpacing));
            line.setAttribute("stroke", "var(--on-surface)");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
        }

        // Draw frets
        for (let i = 0; i <= fretCount; i++) {
            const y = startY + (i * fretSpacing);
            const line = document.createElementNS(this.svgNS, "line");
            line.setAttribute("x1", startX);
            line.setAttribute("y1", y);
            line.setAttribute("x2", startX + ((stringCount - 1) * stringSpacing));
            line.setAttribute("y2", y);
            line.setAttribute("stroke", "var(--on-surface)");
            line.setAttribute("stroke-width", i === 0 ? "4" : "2");
            svg.appendChild(line);
        }
    }

    drawStringLabel(svg, label, index) {
        const text = document.createElementNS(this.svgNS, "text");
        text.textContent = label;
        text.setAttribute("x", 40 + (index * 20));
        text.setAttribute("y", 30);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "var(--on-surface)");
        text.setAttribute("font-family", "Arial");
        text.setAttribute("font-size", "14");
        svg.appendChild(text);
    }

    drawFingerPositions(svg, chord) {
        const startX = 40;
        const startY = 40;
        const stringSpacing = 20;
        const fretSpacing = 35;

        const positions = chord.fingers.split(' ');
        positions.forEach((pos, stringIndex) => {
            if (pos === 'x') {
                this.drawX(svg, startX + (stringIndex * stringSpacing), 20);
            } else if (pos === '-') {
                this.drawOpenString(svg, startX + (stringIndex * stringSpacing), 20);
            } else {
                const fret = parseInt(pos);
                this.drawFinger(svg, startX + (stringIndex * stringSpacing), startY + ((fret - 1) * fretSpacing) + (fretSpacing / 2));
            }
        });
    }

    drawX(svg, x, y) {
        const size = 10;
        const group = document.createElementNS(this.svgNS, "g");
        group.setAttribute("stroke", "var(--error-color)");
        group.setAttribute("stroke-width", "2");

        const line1 = document.createElementNS(this.svgNS, "line");
        line1.setAttribute("x1", x - size);
        line1.setAttribute("y1", y - size);
        line1.setAttribute("x2", x + size);
        line1.setAttribute("y2", y + size);

        const line2 = document.createElementNS(this.svgNS, "line");
        line2.setAttribute("x1", x - size);
        line2.setAttribute("y1", y + size);
        line2.setAttribute("x2", x + size);
        line2.setAttribute("y2", y - size);

        group.appendChild(line1);
        group.appendChild(line2);
        svg.appendChild(group);
    }

    drawOpenString(svg, x, y) {
        const circle = document.createElementNS(this.svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "6");
        circle.setAttribute("stroke", "var(--on-surface)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("fill", "none");
        svg.appendChild(circle);
    }

    drawFinger(svg, x, y) {
        const circle = document.createElementNS(this.svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "8");
        circle.setAttribute("fill", "var(--primary-color)");
        svg.appendChild(circle);
    }
}