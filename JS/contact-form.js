// ========== Contact Form Handler ==========
// Handles form submission and validation

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
});

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validate all fields
    let isValid = true;
    const inputs = e.target.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Simulate form submission
    console.log('Form Data:', data);
    
    // Show success message
    showNotification('Message sent successfully! (This is a demo form)', 'success');
    
    // Reset form
    e.target.reset();
    
    // Remove any validation classes
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    
    // Remove previous validation classes
    field.classList.remove('valid', 'invalid');
    
    // Check if required
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    // Validate email
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }
    
    // Add validation class
    if (value) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
    
    return isValid;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'form-notification';
    notification.textContent = message;
    
    // Add type-specific styling
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${colors[type]};
        color: white;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS for valid/invalid states
const style = document.createElement('style');
style.textContent = `
    .form-input.valid {
        border-color: #28a745;
    }
    
    .form-input.invalid {
        border-color: #dc3545;
    }
    
    .form-input.valid:focus {
        box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
    }
    
    .form-input.invalid:focus {
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
    }
`;
document.head.appendChild(style);