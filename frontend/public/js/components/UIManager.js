class UIManager {
    constructor() {
        this.notificationContainer = null;
        this.activeNotifications = [];
    }

    init() {
        this.notificationContainer = document.getElementById('notifications');
        this.setupGlobalStyles();
    }

    setupGlobalStyles() {
        // Ajouter des styles dynamiques si nécessaire
        document.body.classList.add('app-initialized');
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.notificationContainer.appendChild(notification);
        this.activeNotifications.push(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Suppression automatique
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="uiManager.removeNotification(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('hide');

        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }

            const index = this.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 300);
    }

    showLoader(message = 'Chargement...') {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(loader);
        return loader;
    }

    hideLoader(loader) {
        if (loader && loader.parentElement) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.parentElement.removeChild(loader);
            }, 300);
        }
    }

    updatePlayersList(players, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = players.map((player, index) => `
            <div class="player-item" style="animation-delay: ${index * 0.1}s">
                <div class="player-info">
                    <i class="fas fa-user"></i>
                    <span class="player-name">${player.username}</span>
                    \${player.isCurrentUser ? '<span class="current-user-badge">Vous</span>' : ''}
                </div>
                <div class="player-score">${player.score || 0} pts</div>
            </div>
        `).join('');
    }

    updateLeaderboard(leaderboard, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = leaderboard.map((player, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[index] || '🏅';

            return `
                <div class="leaderboard-item rank-${player.rank}" style="animation-delay: ${index * 0.1}s">
                    <div class="rank-info">
                        <span class="rank-medal">${medal}</span>
                        <span class="rank-number">${player.rank}</span>
                    </div>
                    <div class="player-details">
                        <span class="player-name">${player.username}</span>
                        ${player.isCurrentUser ? '<span class="current-user-badge">Vous</span>' : ''}
                    </div>
                    <div class="player-score">${player.score} pts</div>
                </div>
            `;
        }).join('');
    }
}
