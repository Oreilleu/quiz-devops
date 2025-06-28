// public/js/utils/helpers.js - Fonctions utilitaires complètes

const Utils = {
    // =============================================================================
    // VALIDATION DES DONNÉES
    // =============================================================================

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Le nom d\'utilisateur est requis' };
        }

        const trimmed = username.trim();

        if (trimmed.length < CONFIG.MIN_USERNAME_LENGTH) {
            return { valid: false, error: `Le nom doit faire au moins ${CONFIG.MIN_USERNAME_LENGTH} caractères` };
        }

        if (trimmed.length > CONFIG.MAX_USERNAME_LENGTH) {
            return { valid: false, error: `Le nom ne peut pas dépasser ${CONFIG.MAX_USERNAME_LENGTH} caractères` };
        }

        // Vérifier les caractères autorisés (lettres, chiffres, tirets et underscores)
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            return { valid: false, error: 'Le nom ne peut contenir que des lettres, chiffres, _ et -' };
        }

        // Vérifier qu'il ne commence pas par un chiffre
        if (/^[0-9]/.test(trimmed)) {
            return { valid: false, error: 'Le nom ne peut pas commencer par un chiffre' };
        }

        // Mots interdits
        const forbiddenWords = ['admin', 'root', 'system', 'null', 'undefined', 'bot'];
        if (forbiddenWords.some(word => trimmed.toLowerCase().includes(word))) {
            return { valid: false, error: 'Ce nom contient un mot interdit' };
        }

        return { valid: true };
    },

    validateRoomName(roomName) {
        if (!roomName || typeof roomName !== 'string') {
            return { valid: false, error: 'Le nom de salle est requis' };
        }

        const trimmed = roomName.trim();

        if (trimmed.length < CONFIG.MIN_ROOM_NAME_LENGTH) {
            return { valid: false, error: `Le nom de salle doit faire au moins ${CONFIG.MIN_ROOM_NAME_LENGTH} caractères` };
        }

        if (trimmed.length > CONFIG.MAX_ROOM_NAME_LENGTH) {
            return { valid: false, error: `Le nom de salle ne peut pas dépasser ${CONFIG.MAX_ROOM_NAME_LENGTH} caractères` };
        }

        // Caractères autorisés plus flexibles pour les salles
        if (!/^[a-zA-Z0-9_\-\s]+$/.test(trimmed)) {
            return { valid: false, error: 'Le nom de salle ne peut contenir que des lettres, chiffres, espaces, _ et -' };
        }

        return { valid: true };
    },


    // =============================================================================
    // FORMATAGE ET MANIPULATION DE DONNÉES
    // =============================================================================

    formatTime(seconds) {
        if (seconds < 0) return '00:00';

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

        return new Date(date).toLocaleDateString('fr-FR');
    },

    formatScore(score) {
        if (score >= 1000000) {
            return (score / 1000000).toFixed(1) + 'M';
        }
        if (score >= 1000) {
            return (score / 1000).toFixed(1) + 'k';
        }
        return score.toString();
    },

    formatPercentage(value, total) {
        if (total === 0) return '0%';
        return Math.round((value / total) * 100) + '%';
    },

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // =============================================================================
    // MANIPULATION DU DOM
    // =============================================================================

    createElement(tag, className = '', innerHTML = '', attributes = {}) {
        const element = document.createElement(tag);

        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;
    },

    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    hasClass(element, className) {
        return element && element.classList.contains(className);
    },

    findParent(element, selector) {
        let parent = element.parentElement;
        while (parent && !parent.matches(selector)) {
            parent = parent.parentElement;
        }
        return parent;
    },

    // =============================================================================
    // ANIMATIONS ET EFFETS VISUELS
    // =============================================================================

    fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.display = 'block';

            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.opacity = progress.toString();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    },

    fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const startOpacity = parseFloat(getComputedStyle(element).opacity);
            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.opacity = (startOpacity * (1 - progress)).toString();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    },

    slideDown(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.display = 'block';

            const targetHeight = element.scrollHeight;
            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.height = (targetHeight * progress) + 'px';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    },

    slideUp(element, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise(resolve => {
            const startHeight = element.scrollHeight;
            element.style.height = startHeight + 'px';
            element.style.overflow = 'hidden';

            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                element.style.height = (startHeight * (1 - progress)) + 'px';

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    element.style.height = '';
                    element.style.overflow = '';
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    },

    shake(element, duration = 600) {
        if (!element) return;

        element.classList.add('animate-shake');
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, duration);
    },

    pulse(element, duration = 2000) {
        if (!element) return;

        element.classList.add('animate-pulse');
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, duration);
    },

    // =============================================================================
    // STOCKAGE LOCAL
    // =============================================================================

    setLocalStorage(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            return false;
        }
    },

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    },

    clearLocalStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            return false;
        }
    },

    // =============================================================================
    // UTILITAIRES DE PERFORMANCE
    // =============================================================================

    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    throttle(func, wait) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, wait);
            }
        };
    },

    // =============================================================================
    // UTILITAIRES RÉSEAU ET CLIPBOARD
    // =============================================================================

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback pour les navigateurs plus anciens
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            }
        } catch (error) {
            return false;
        }
    },


    // =============================================================================
    // UTILITAIRES DE GÉNÉRATION
    // =============================================================================

    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },


    // =============================================================================
    // UTILITAIRES MATHÉMATIQUES
    // =============================================================================

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },




    // =============================================================================
    // UTILITAIRES DE DEBUGGING
    // =============================================================================

    log(message, data = null, type = 'info') {
        if (process?.env?.NODE_ENV === 'development') {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] ${type.toUpperCase()}:`;

            switch (type) {
                case 'error':
                    break;
                case 'warn':
                    break;
                case 'debug':
                    break;
                default:
            }
        }
    },

};

// Étendre l'objet global window pour un accès facile
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}