// Akkord-Bibliothek mit SVG-Visualisierung
const chordLibrary = [
    {
        name: 'A',
        type: 'Dur',
        fingers: '- 2 2 2 - x',
        description: 'Einer der häufigsten offenen Akkorde, wird in vielen Liedern verwendet.'
    },
    {
        name: 'D',
        type: 'Dur',
        fingers: '2 3 2 - x x',
        description: 'Grundlegender offener Akkord, oft in Kombination mit A und G verwendet.'
    },
    {
        name: 'G',
        type: 'Dur',
        fingers: '3 3 - - 2 3',
        description: 'Fundamentaler Akkord für viele Progressionen.'
    },
    {
        name: 'Em',
        type: 'Moll',
        fingers: '- - - 2 2 -',
        description: 'Häufiger Moll-Akkord, einfach für Anfänger.'
    }
];

class ChordLibrary {
    constructor() {
        this.chordGrid = document.querySelector('.chord-grid');
        this.chordSVG = new ChordSVG();
        this.renderChords();
    }

    createChordCard(chord) {
        const card = document.createElement('div');
        card.className = 'chord-card';
        
        const chordDiagram = this.chordSVG.createChordDiagram(chord);
        
        card.innerHTML = `
            <h3>${chord.name}<span class="chord-type">${chord.type}</span></h3>
            <div class="chord-details">
                <p><strong>Fingerposition:</strong> ${chord.fingers}</p>
                <p>${chord.description}</p>
            </div>
        `;

        // Insert the SVG diagram after the title
        card.querySelector('h3').insertAdjacentElement('afterend', chordDiagram);
        
        // Add click event listener for expanding/collapsing
        card.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
        
        return card;
    }

    renderChords() {
        chordLibrary.forEach(chord => {
            const chordCard = this.createChordCard(chord);
            this.chordGrid.appendChild(chordCard);
        });
    }
}

// Initialize chord library when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChordLibrary();
});