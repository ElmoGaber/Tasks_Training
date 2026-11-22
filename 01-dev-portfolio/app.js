// Simple portfolio interaction with dark mode
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference or use system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Set initial theme
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // Use system preference
            document.body.classList.toggle('dark', prefersDarkScheme.matches);
        }
        updateThemeIcon();
    }
    
    // Update theme icon based on current theme
    function updateThemeIcon() {
        if (document.body.classList.contains('dark')) {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        } else {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    }
    
    // Event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark', e.matches);
            updateThemeIcon();
        }
    });
    
    // Initialize
    setInitialTheme();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Highlight current navigation link based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav ul li a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});