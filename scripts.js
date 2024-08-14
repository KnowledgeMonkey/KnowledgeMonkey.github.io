document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.container, .guide-box, footer');
    elements.forEach(el => {
        el.style.opacity = 0;
        el.style.transition = 'opacity 1s ease-in-out';
        setTimeout(() => {
            el.style.opacity = 1;
        }, 100);
    });
});
