const createSnowflakes = () => {
    const body = document.querySelector('body');
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`; // Random horizontal position
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`; // Random falling speed
        snowflake.style.animationDelay = `${Math.random() * 5}s`; // Random delay for randomness
        snowflake.style.width = snowflake.style.height = `${Math.random() * 4 + 2}px`; // Random size
        body.appendChild(snowflake);
    }
};

document.addEventListener("mousemove", (e) => {
    const parallaxLayers = document.querySelectorAll(".layer");
    const snowflakes = document.querySelectorAll(".snowflake");

    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Apply parallax effect to layers
    parallaxLayers.forEach((layer, index) => {
        const moveX = (mouseX - 0.5) * (10 * (index + 1));
        const moveY = (mouseY - 0.5) * (10 * (index + 1));

        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    // Apply mouse-based movement to snowflakes (optional)
    snowflakes.forEach((snowflake) => {
        const moveX = (mouseX - 0.5) * 5;
        const moveY = (mouseY - 0.5) * 5;

        snowflake.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// When the user clicks to enter, hide the overlay and start the music
// Play background music
const audio = document.querySelector('audio');
audio.volume = 0.2; // Set initial volume to 20% (you can adjust this value)

document.addEventListener("mousemove", (e) => {
    const parallaxLayers = document.querySelectorAll(".layer");

    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    parallaxLayers.forEach((layer, index) => {
        const moveX = (mouseX - 0.5) * (10 * (index + 1)); 
        const moveY = (mouseY - 0.5) * (10 * (index + 1));

        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// "Click to Enter" functionality
const enterScreen = document.getElementById('enter-screen');
enterScreen.addEventListener('click', () => {
    document.body.classList.add('loaded');
    audio.play(); // Start music after entering
});

// Mute button functionality
const muteButton = document.createElement('button');
muteButton.classList.add('mute-button');
muteButton.innerText = '🔊';
document.body.appendChild(muteButton);

muteButton.addEventListener('click', () => {
    if (audio.muted) {
        audio.muted = false;
        muteButton.innerText = '🔊';
    } else {
        audio.muted = true;
        muteButton.innerText = '🔇';
    }
});


// Add CSS for snowflakes
const style = document.createElement('style');
style.innerHTML = `
.snowflake {
    position: absolute;
    top: -10px; /* Start above the viewport */
    width: 5px;
    height: 5px;
    background-color: #fff;
    border-radius: 50%;
    animation: snowfall linear infinite;
    opacity: 0.7;
    z-index: 10; /* Ensure snowflakes are on top */
}

@keyframes snowfall {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
}
`;
document.head.appendChild(style);

createSnowflakes();
