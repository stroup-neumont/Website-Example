// ========== Date and Time Utilities ==========
const DateUtils = {
    /**
     * Get current greeting based on time of day
     * @returns {string} - Morning, afternoon, or evening greeting
     */
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    },

    /**
     * Format time duration in minutes and seconds (for audio player)
     * @param {number} seconds - Duration in seconds
     * @returns {string} - Formatted time string (mm:ss)
     */
    formatDuration(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// ========== Number Utilities ==========
const NumberUtils = {
    /**
     * Format file size in human readable format (for audio player)
     * @param {number} bytes - Size in bytes
     * @returns {string} - Formatted size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * Generate random number between min and max (for games)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number
     */
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

// ========== Storage Utilities ==========
const StorageUtils = {
    /**
     * Save data to localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @returns {boolean} - Success status
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    /**
     * Load data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} - Retrieved data or default
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }
};

// ========== DOM Utilities ==========
const DOMUtils = {
    /**
     * Check if element is in viewport (for scroll animations)
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} - Is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} target - Element or selector
     */
    scrollTo(target) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
};

// ========== Validation Utilities ==========
const ValidationUtils = {
    /**
     * Check if string is empty or whitespace
     * @param {string} str - String to check
     * @returns {boolean} - Is empty
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Validate file type (for audio player)
     * @param {string} filename - Filename
     * @param {Array} allowedTypes - Allowed extensions
     * @returns {boolean} - Is valid type
     */
    isValidFileType(filename, allowedTypes) {
        const extension = filename.split('.').pop().toLowerCase();
        return allowedTypes.includes(extension);
    }
};

// ========== Make utilities globally available ==========
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StorageUtils = StorageUtils;
window.DOMUtils = DOMUtils;
window.ValidationUtils = ValidationUtils;

// Combined Utils object for convenience
window.Utils = {
    Date: DateUtils,
    Number: NumberUtils,
    Storage: StorageUtils,
    DOM: DOMUtils,
    Validation: ValidationUtils
};