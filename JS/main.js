// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    initializeThemeToggle();
    initializeSkillsToggle();
    initializeScrollReveal();
});

// ========== Theme Toggle Functionality ==========
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.textContent = '☀️ Light Mode';
    }
    
    // Add click event to theme toggle button
    themeToggle.addEventListener('click', function() {
        // Toggle the dark theme class
        body.classList.toggle('dark-theme');
        
        // Check if dark theme is now active
        const isDark = body.classList.contains('dark-theme');
        
        // Update button text
        themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        
        // Save theme preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ========== Skills Toggle Functionality ==========
function initializeSkillsToggle() {
    const skillsToggle = document.getElementById('skills-toggle');
    const skillsList = document.getElementById('skills-list');
    
    if (!skillsToggle || !skillsList) return;
    
    // Set initial state - collapsed by default
    skillsList.classList.add('hidden');
    skillsToggle.textContent = 'Show Skills';
    
    skillsToggle.addEventListener('click', function() {
        const isHidden = skillsList.classList.contains('hidden');
        
        if (isHidden) {
            skillsList.classList.remove('hidden');
            skillsToggle.textContent = 'Hide Skills';
        } else {
            skillsList.classList.add('hidden');
            skillsToggle.textContent = 'Show Skills';
        }
    });
}

// ========== Scroll Reveal Animation ==========
function initializeScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
    
    if (!revealElements.length) return;
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('revealed');
            }
        });
    };
    
    // Initial check
    revealOnScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', revealOnScroll);
}