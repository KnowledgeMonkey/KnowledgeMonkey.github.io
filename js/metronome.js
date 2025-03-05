class Metronome {
    constructor() {
        this.tempo = 120;
        this.isPlaying = false;
        this.intervalId = null;
        this.audioContext = null;
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.1;

        // DOM elements
        this.tempoDisplay = document.querySelector('.tempo-display');
        this.playBtn = document.getElementById('play-btn');
        this.decreaseBtn = document.getElementById('decrease-tempo');
        this.increaseBtn = document.getElementById('increase-tempo');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => {
            // Initialize audio context on first user interaction
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            this.togglePlay();
        });
        this.decreaseBtn.addEventListener('click', () => this.decreaseTempo());
        this.increaseBtn.addEventListener('click', () => this.increaseTempo());
    }

    playClick() {
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.frequency.value = 1000;
        gainNode.gain.value = 0.5;

        osc.start(this.nextNoteTime);
        osc.stop(this.nextNoteTime + 0.05);
    }

    scheduler() {
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.playClick();
            this.nextNoteTime += 60.0 / this.tempo;
        }
    }

    start() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.nextNoteTime = this.audioContext.currentTime;
        this.playBtn.querySelector('.material-icons').textContent = 'pause';
        
        // Initialize audio context on first play
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        this.intervalId = setInterval(() => this.scheduler(), 25);
    }

    stop() {
        this.isPlaying = false;
        this.playBtn.querySelector('.material-icons').textContent = 'play_arrow';
        clearInterval(this.intervalId);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }

    updateTempoDisplay() {
        this.tempoDisplay.textContent = `${this.tempo} BPM`;
    }

    increaseTempo() {
        if (this.tempo < 240) {
            this.tempo += 5;
            this.updateTempoDisplay();
        }
    }

    decreaseTempo() {
        if (this.tempo > 40) {
            this.tempo -= 5;
            this.updateTempoDisplay();
        }
    }
}

// Initialize metronome
document.addEventListener('DOMContentLoaded', () => {
    const metronome = new Metronome();
});