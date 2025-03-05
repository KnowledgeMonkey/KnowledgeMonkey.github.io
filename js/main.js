document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Handle hash changes for direct links
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetLink = document.querySelector(`[href="#${hash}"]`);
            if (targetLink) {
                targetLink.click();
            }
        }
    });

    // Initial hash handling and default home section
    const homeSection = document.getElementById('home');
    const homeLink = document.querySelector('[href="#home"]');
    
    sections.forEach(section => section.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    homeSection.classList.add('active');
    homeLink.classList.add('active');
});