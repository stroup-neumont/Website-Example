// ========== Skills Animation JavaScript ==========
// Animates skill bars when they come into view

document.addEventListener('DOMContentLoaded', function() {
    initializeSkillAnimations();
});

function initializeSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    if (!skillBars.length) return;
    
    // Create intersection observer
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate the skill bar
                const skillBar = entry.target;
                const targetWidth = skillBar.style.width;
                
                // Reset width to 0 for animation
                skillBar.style.width = '0%';
                
                // Trigger animation after a small delay
                setTimeout(() => {
                    skillBar.style.width = targetWidth;
                    skillBar.classList.add('animated');
                }, 100);
                
                // Stop observing this element
                skillObserver.unobserve(skillBar);
            }
        });
    }, observerOptions);
    
    // Observe all skill bars
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}