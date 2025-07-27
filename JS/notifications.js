/**
 * Notification System
 * Provides toast notifications, alerts, and user feedback
 */
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
        this.defaultOptions = {
            duration: 4000,
            position: 'top-right',
            closable: true,
            pauseOnHover: true,
            showProgress: true,
            maxNotifications: 5
        };
    }

    /**
     * Create notification container
     * @returns {HTMLElement} - Container element
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {Object} options - Additional options
     * @returns {string} - Notification ID
     */
    show(message, type = 'info', options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const id = this.generateId();
        
        // Remove oldest notification if at max capacity
        if (this.notifications.size >= config.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }

        const notification = this.createNotification(id, message, type, config);
        this.container.appendChild(notification);
        this.notifications.set(id, { element: notification, config });

        // Auto-remove after duration
        if (config.duration > 0) {
            setTimeout(() => this.remove(id), config.duration);
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        return id;
    }

    /**
     * Create notification element
     * @param {string} id - Notification ID
     * @param {string} message - Message text
     * @param {string} type - Notification type
     * @param {Object} config - Configuration options
     * @returns {HTMLElement} - Notification element
     */
    createNotification(id, message, type, config) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.dataset.id = id;
        notification.style.cssText = `
            background: ${this.getTypeColor(type)};
            color: white;
            padding: 16px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: auto;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            word-wrap: break-word;
            max-width: 100%;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        `;

        // Icon
        const icon = document.createElement('span');
        icon.innerHTML = this.getTypeIcon(type);
        icon.style.cssText = `
            font-size: 18px;
            flex-shrink: 0;
            margin-top: 1px;
        `;

        // Content
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            line-height: 1.4;
        `;
        content.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(content);

        // Close button
        if (config.closable) {
            const closeBtn = this.createCloseButton(id);
            notification.appendChild(closeBtn);
        }

        // Progress bar
        if (config.showProgress && config.duration > 0) {
            const progressBar = this.createProgressBar(config.duration);
            notification.appendChild(progressBar);
        }

        // Pause on hover
        if (config.pauseOnHover) {
            this.addHoverPause(notification, id, config);
        }

        return notification;
    }

    /**
     * Create close button
     * @param {string} id - Notification ID
     * @returns {HTMLElement} - Close button
     */
    createCloseButton(id) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 8px;
            opacity: 0.7;
            transition: opacity 0.2s ease;
            flex-shrink: 0;
        `;
        
        closeBtn.addEventListener('click', () => this.remove(id));
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
        
        return closeBtn;
    }

    /**
     * Create progress bar
     * @param {number} duration - Duration in milliseconds
     * @returns {HTMLElement} - Progress bar element
     */
    createProgressBar(duration) {
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255,255,255,0.2);
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            height: 100%;
            background: rgba(255,255,255,0.8);
            width: 100%;
            animation: notificationProgress ${duration}ms linear;
        `;

        // Add progress animation CSS if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `;
            document.head.appendChild(style);
        }

        progressContainer.appendChild(progressBar);
        return progressContainer;
    }

    /**
     * Add hover pause functionality
     * @param {HTMLElement} notification - Notification element
     * @param {string} id - Notification ID
     * @param {Object} config - Configuration
     */
    addHoverPause(notification, id, config) {
        let timeoutId;
        let remainingTime = config.duration;
        let startTime = Date.now();

        const pause = () => {
            const elapsed = Date.now() - startTime;
            remainingTime = Math.max(0, remainingTime - elapsed);
            clearTimeout(timeoutId);
        };

        const resume = () => {
            startTime = Date.now();
            if (remainingTime > 0) {
                timeoutId = setTimeout(() => this.remove(id), remainingTime);
            }
        };

        notification.addEventListener('mouseenter', pause);
        notification.addEventListener('mouseleave', resume);
    }

    /**
     * Remove notification
     * @param {string} id - Notification ID
     */
    remove(id) {
        const notificationData = this.notifications.get(id);
        if (!notificationData) return;

        const { element } = notificationData;
        
        // Animate out
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 300);
    }

    /**
     * Clear all notifications
     */
    clear() {
        this.notifications.forEach((_, id) => this.remove(id));
    }

    /**
     * Get notification type color
     * @param {string} type - Notification type
     * @returns {string} - Color value
     */
    getTypeColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            default: '#6c757d'
        };
        return colors[type] || colors.default;
    }

    /**
     * Get notification type icon
     * @param {string} type - Notification type
     * @returns {string} - Icon HTML
     */
    getTypeIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            default: '●'
        };
        return icons[type] || icons.default;
    }

    /**
     * Generate unique notification ID
     * @returns {string} - Unique ID
     */
    generateId() {
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
}

// ========== Modal Alert System ==========
class AlertSystem {
    /**
     * Show confirmation dialog
     * @param {string} message - Message to display
     * @param {Object} options - Dialog options
     * @returns {Promise<boolean>} - User's choice
     */
    static confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.createModal('confirm', message, options, resolve);
            document.body.appendChild(modal);
            this.showModal(modal);
        });
    }

    /**
     * Show alert dialog
     * @param {string} message - Message to display
     * @param {Object} options - Dialog options
     * @returns {Promise<void>} - Promise that resolves when closed
     */
    static alert(message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.createModal('alert', message, options, resolve);
            document.body.appendChild(modal);
            this.showModal(modal);
        });
    }

    /**
     * Show prompt dialog
     * @param {string} message - Message to display
     * @param {string} defaultValue - Default input value
     * @param {Object} options - Dialog options
     * @returns {Promise<string|null>} - User input or null if cancelled
     */
    static prompt(message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const modal = this.createModal('prompt', message, { ...options, defaultValue }, resolve);
            document.body.appendChild(modal);
            this.showModal(modal);
        });
    }

    /**
     * Create modal dialog
     * @param {string} type - Modal type
     * @param {string} message - Message text
     * @param {Object} options - Options
     * @param {Function} resolve - Promise resolve function
     * @returns {HTMLElement} - Modal element
     */
    static createModal(type, message, options, resolve) {
        const modal = document.createElement('div');
        modal.className = 'alert-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 400px;
            min-width: 300px;
            margin: 20px;
            transform: translateY(-20px);
            transition: transform 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        // Message
        const messageEl = document.createElement('p');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin: 0 0 20px 0;
            line-height: 1.5;
            color: #333;
        `;
        dialog.appendChild(messageEl);

        // Input for prompt
        let input;
        if (type === 'prompt') {
            input = document.createElement('input');
            input.type = 'text';
            input.value = options.defaultValue || '';
            input.style.cssText = `
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 20px;
                font-size: 14px;
            `;
            dialog.appendChild(input);
        }

        // Buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        `;

        const createButton = (text, isPrimary, clickHandler) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s ease;
                ${isPrimary ? 
                    'background: #007bff; color: white;' : 
                    'background: #6c757d; color: white;'
                }
            `;
            button.addEventListener('click', clickHandler);
            return button;
        };

        if (type === 'confirm' || type === 'prompt') {
            const cancelBtn = createButton('Cancel', false, () => {
                this.closeModal(modal);
                resolve(type === 'prompt' ? null : false);
            });
            buttonContainer.appendChild(cancelBtn);
        }

        const okBtn = createButton(type === 'confirm' ? 'OK' : 'OK', true, () => {
            this.closeModal(modal);
            if (type === 'prompt') {
                resolve(input.value);
            } else if (type === 'confirm') {
                resolve(true);
            } else {
                resolve();
            }
        });
        buttonContainer.appendChild(okBtn);

        dialog.appendChild(buttonContainer);
        modal.appendChild(dialog);

        // Handle escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                resolve(type === 'prompt' ? null : type === 'confirm' ? false : undefined);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // Handle click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
                resolve(type === 'prompt' ? null : type === 'confirm' ? false : undefined);
            }
        });

        return modal;
    }

    /**
     * Show modal with animation
     * @param {HTMLElement} modal - Modal element
     */
    static showModal(modal) {
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            const dialog = modal.querySelector('div');
            dialog.style.transform = 'translateY(0)';
            
            // Focus first input or button
            const focusTarget = modal.querySelector('input, button');
            if (focusTarget) {
                focusTarget.focus();
            }
        });
    }

    /**
     * Close modal with animation
     * @param {HTMLElement} modal - Modal element
     */
    static closeModal(modal) {
        modal.style.opacity = '0';
        const dialog = modal.querySelector('div');
        dialog.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// ========== Initialize and Export ==========
const notifications = new NotificationSystem();

// Global notification functions
window.showNotification = (message, type, options) => notifications.show(message, type, options);
window.showSuccess = (message, options) => notifications.success(message, options);
window.showError = (message, options) => notifications.error(message, options);
window.showWarning = (message, options) => notifications.warning(message, options);
window.showInfo = (message, options) => notifications.info(message, options);

// Global alert functions
window.confirmDialog = (message, options) => AlertSystem.confirm(message, options);
window.alertDialog = (message, options) => AlertSystem.alert(message, options);
window.promptDialog = (message, defaultValue, options) => AlertSystem.prompt(message, defaultValue, options);

// Export classes
window.NotificationSystem = NotificationSystem;
window.AlertSystem = AlertSystem;

// Export instance
window.notifications = notifications;