class FinalScreen {
    constructor() {
        this.isVisible = false;
        this.finalData = null;
    }
    
    init() {
        // Initialize final screen
    }

    render(data = null) {
        this.finalData = data || {};
        
        return `
            <div class="screen final-screen">
                <div class="final-container">
                    <div class="final-header">
                        <h1><i class="fas fa-flag-checkered"></i> Quiz Terminé !</h1>
                        <p>Bravo à tous les participants !</p>
                    </div>

                    <div class="final-content">
                        <div class="final-leaderboard">
                            <h2><i class="fas fa-trophy"></i> Classement Final</h2>
                            <div class="final-leaderboard-list">
                                ${this.renderFinalLeaderboard()}
                            </div>
                        </div>

                        <div class="game-stats">
                            <h3><i class="fas fa-chart-bar"></i> Statistiques de la partie</h3>
                            <div class="stats-grid">
                                ${this.renderGameStats()}
                            </div>
                        </div>
                    </div>

                    <div class="final-actions">
                        <button class="btn btn-primary btn-large" onclick="finalScreen.backToLogin()">
                            <i class="fas fa-home"></i> Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderFinalLeaderboard() {
        const leaderboard = this.finalData.finalResults || this.finalData.leaderboard || [];
        
        if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
            return '<div class="no-results">Aucun résultat disponible</div>';
        }

        return leaderboard.map((player, index) => {
            const position = index + 1;
            let medal = '';
            let positionClass = '';
            
            if (position === 1) {
                medal = '🥇';
                positionClass = 'first';
            } else if (position === 2) {
                medal = '🥈';
                positionClass = 'second';
            } else if (position === 3) {
                medal = '🥉';
                positionClass = 'third';
            } else {
                medal = `#${position}`;
                positionClass = 'other';
            }
            
            return `
                <div class="final-leaderboard-item ${positionClass}">
                    <div class="position">${medal}</div>
                    <div class="player-info">
                        <div class="player-name">${player.username}</div>
                        <div class="player-details">
                            <span class="score">${player.score || 0} points</span>
                            <span class="correct-answers">${player.correctAnswers || 0} bonnes réponses</span>
                            <span class="accuracy">${this.calculateAccuracy(player)}% de réussite</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderGameStats() {
        const stats = this.finalData.gameStats || {};
        const totalQuestions = stats.totalQuestions || 10;
        const category = stats.category || 'général';
        const playersCount = stats.playersCount || 0;
        const duration = stats.duration ? this.formatDuration(stats.duration) : 'N/A';

        return `
            <div class="stat-item">
                <i class="fas fa-question-circle"></i>
                <div class="stat-info">
                    <div class="stat-value">${totalQuestions}</div>
                    <div class="stat-label">Questions</div>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-tag"></i>
                <div class="stat-info">
                    <div class="stat-value">${CATEGORIES[category] || category}</div>
                    <div class="stat-label">Catégorie</div>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-users"></i>
                <div class="stat-info">
                    <div class="stat-value">${playersCount}</div>
                    <div class="stat-label">Joueurs</div>
                </div>
            </div>
            <div class="stat-item">
                <i class="fas fa-clock"></i>
                <div class="stat-info">
                    <div class="stat-value">${duration}</div>
                    <div class="stat-label">Durée</div>
                </div>
            </div>
        `;
    }

    calculateAccuracy(player) {
        const totalQuestions = this.finalData.gameStats?.totalQuestions || 10;
        const correctAnswers = player.correctAnswers || 0;
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    show(data = null) {
        this.isVisible = true;
        this.finalData = data || this.finalData;
        this.setupEventListeners();
    }

    hide() {
        this.isVisible = false;
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Setup any needed event listeners
    }

    removeEventListeners() {
        // Remove event listeners
    }

    backToLogin() {
        window.app.screenManager.showScreen('login');
    }
}

// Créer une instance globale
window.finalScreen = new FinalScreen();