const createSnowflakes = () => {
    const body = document.querySelector('body');
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`; // Snowflake falling speed
        snowflake.style.animationDelay = `${Math.random() * 5}s`; // Delay for randomness
        snowflake.style.width = snowflake.style.height = `${Math.random() * 4 + 2}px`; // Random size
        body.appendChild(snowflake);
    }
};

document.addEventListener("mousemove", (e) => {
    const parallaxLayers = document.querySelectorAll(".layer");

    const mouseX = e.clientX / window.innerWidth; // Horizontal mouse position (normalized)
    const mouseY = e.clientY / window.innerHeight; // Vertical mouse position (normalized)

    parallaxLayers.forEach((layer, index) => {
        const moveX = (mouseX - 0.5) * (10 * (index + 1)); // Varies based on layer depth
        const moveY = (mouseY - 0.5) * (10 * (index + 1));

        layer.style.transform = `translate(${moveX}px, ${moveY}px)`; // Apply movement
    });
});

// CSS for snowflakes
const style = document.createElement('style');
style.innerHTML = `
.snowflake {
    position: absolute;
    top: -10px;
    width: 5px;
    height: 5px;
    background-color: #fff;
    border-radius: 50%;
    animation: snowfall linear infinite;
    opacity: 0.7;
}

@keyframes snowfall {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
}
`;
document.head.appendChild(style);

createSnowflakes();
