const createSnowflakes = () => {
    const body = document.querySelector('body');
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.width = snowflake.style.height = `${Math.random() * 4 + 2}px`;
        body.appendChild(snowflake);
    }
};

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
