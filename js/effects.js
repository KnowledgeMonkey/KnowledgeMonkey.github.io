class MetallicEffects {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.flowPoints = [];
        this.welcomeOpacity = 0;
        this.welcomeY = 50;

        this.setupCanvas();
        this.createGradientBackground();
        this.initializeFlowPoints();
        this.animate();
    }

    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createGradientBackground();
        this.initializeFlowPoints();
    }

    createGradientBackground() {
        this.gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        this.gradient.addColorStop(0, '#1a1a1a');
        this.gradient.addColorStop(1, '#2a2a2a');
    }

    initializeFlowPoints() {
        this.flowPoints = [];
        const pointCount = Math.min(window.innerWidth, window.innerHeight) / 20;
        
        for (let i = 0; i < pointCount; i++) {
            this.flowPoints.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                angle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1,
                size: 2 + Math.random() * 3,
                hue: Math.random() < 0.5 ? 51 : 0, // Gold or Platinum
                opacity: 0.1 + Math.random() * 0.4
            });
        }
    }

    drawWelcomeMessage() {
        if (this.welcomeOpacity < 1) {
            this.welcomeOpacity += 0.01;
            this.welcomeY += 0.2;
        }

        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Main text
        this.ctx.font = 'bold 48px Arial';
        const gradient = this.ctx.createLinearGradient(
            this.canvas.width/2 - 100,
            0,
            this.canvas.width/2 + 100,
            0
        );
        gradient.addColorStop(0, 'hsl(51, 100%, 70%)');
        gradient.addColorStop(0.5, 'hsl(0, 0%, 90%)');
        gradient.addColorStop(1, 'hsl(51, 100%, 70%)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = this.welcomeOpacity;
        this.ctx.fillText('Hello Emi :3', this.canvas.width/2, this.welcomeY);
        
        // Glowing effect
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('Hello Emi :3', this.canvas.width/2, this.welcomeY);
        
        this.ctx.restore();
    }

    animate() {
        this.ctx.fillStyle = this.gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw welcome message
        this.drawWelcomeMessage();

        // Animate flow points
        this.flowPoints.forEach(point => {
            // Update position
            point.x += Math.cos(point.angle) * point.speed;
            point.y += Math.sin(point.angle) * point.speed;
            point.angle += (Math.random() - 0.5) * 0.1;

            // Wrap around screen
            if (point.x < 0) point.x = this.canvas.width;
            if (point.x > this.canvas.width) point.x = 0;
            if (point.y < 0) point.y = this.canvas.height;
            if (point.y > this.canvas.height) point.y = 0;

            // Draw flowing effect
            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, point.size * 2
            );
            
            const color = point.hue === 51 ? 
                `hsla(51, 100%, 50%, ${point.opacity})` : // Gold
                `hsla(0, 0%, 90%, ${point.opacity})`; // Platinum
            
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the metallic effects when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MetallicEffects();
    window.addEventListener('resize', () => {
        new MetallicEffects();
    });
});