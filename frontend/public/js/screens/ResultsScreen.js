class ResultsScreen {
    constructor() {
        this.isVisible = false;
        this.resultsData = null;
        this.nextQuestionTimer = null;
    }
    
    init() {
        // Initialize results screen
    }

    render(data = null) {
        this.resultsData = data || {};
        
        return `
            <div class="screen results-screen">
                <div class="results-container">
                    <div class="results-header">
                        <h1><i class="fas fa-poll"></i> Résultats de la question</h1>
                        <div class="correct-answer">
                            <i class="fas fa-check-circle"></i>
                            <span>Bonne réponse: <strong>${this.resultsData.correctOption || 'N/A'}</strong></span>
                        </div>
                        ${this.resultsData.explanation ? `
                            <div class="explanation">
                                <i class="fas fa-lightbulb"></i>
                                <p>${this.resultsData.explanation}</p>
                            </div>
                        ` : ''}
                    </div>

                    <div class="results-content">
                        <div class="players-results">
                            <h3><i class="fas fa-users"></i> Réponses des joueurs</h3>
                            <div class="results-grid" id="results-grid">
                                ${this.renderPlayerResults()}
                            </div>
                        </div>

                        <div class="leaderboard">
                            <h3><i class="fas fa-trophy"></i> Classement</h3>
                            <div class="leaderboard-list" id="leaderboard-list">
                                ${this.renderLeaderboard()}
                            </div>
                        </div>
                    </div>

                    <div class="results-footer">
                        <div class="next-question-timer" id="next-question-timer">
                            <i class="fas fa-forward"></i>
                            <span>Prochaine question dans <strong id="timer-countdown">3</strong> secondes...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlayerResults() {
        if (!this.resultsData.results || !Array.isArray(this.resultsData.results)) {
            return '<div class="no-results">Aucun résultat disponible</div>';
        }

        return this.resultsData.results.map((result, index) => {
            const isCorrect = result.isCorrect;
            const answerTime = result.answerTime ? `${(result.answerTime / 1000).toFixed(1)}s` : 'Pas de réponse';
            
            return `
                <div class="player-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="player-info">
                        <div class="player-avatar">
                            <i class="fas ${isCorrect ? 'fa-check' : 'fa-times'}"></i>
                        </div>
                        <div class="player-details">
                            <div class="player-name">${result.username}</div>
                            <div class="player-answer">
                                ${result.answer !== undefined ? `Réponse: ${String.fromCharCode(65 + result.answer)}` : 'Pas de réponse'}
                            </div>
                        </div>
                    </div>
                    <div class="player-score">
                        <div class="points-earned ${isCorrect ? 'positive' : 'zero'}">
                            +${result.points || 0} pts
                        </div>
                        <div class="total-score">${result.totalScore || 0} pts total</div>
                        <div class="answer-time">${answerTime}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLeaderboard() {
        if (!this.resultsData.leaderboard || !Array.isArray(this.resultsData.leaderboard)) {
            return '<div class="no-leaderboard">Classement indisponible</div>';
        }

        return this.resultsData.leaderboard.map((player, index) => {
            const position = index + 1;
            const medal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : `#${position}`;
            
            return `
                <div class="leaderboard-item position-${position}">
                    <div class="position">${medal}</div>
                    <div class="player-info">
                        <div class="player-name">${player.username}</div>
                        <div class="player-stats">
                            <span class="score">${player.score || 0} pts</span>
                            <span class="correct-answers">${player.correctAnswers || 0} bonnes réponses</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    show(data = null) {
        this.isVisible = true;
        this.resultsData = data || this.resultsData;
        
        this.setupEventListeners();
        this.startNextQuestionTimer();
    }

    hide() {
        this.isVisible = false;
        this.clearNextQuestionTimer();
        this.removeEventListeners();
    }

    setupEventListeners() {
        if (window.app?.socketManager) {
            window.app.socketManager.on('socket:new-question', this.handleNewQuestion.bind(this));
            window.app.socketManager.on('socket:game-ended', this.handleGameEnded.bind(this));
        }
    }

    removeEventListeners() {
        if (window.app?.socketManager) {
            window.app.socketManager.off('socket:new-question', this.handleNewQuestion.bind(this));
            window.app.socketManager.off('socket:game-ended', this.handleGameEnded.bind(this));
        }
    }

    startNextQuestionTimer() {
        let countdown = 3;
        const timerElement = document.getElementById('timer-countdown');
        
        this.nextQuestionTimer = setInterval(() => {
            countdown--;
            if (timerElement) {
                timerElement.textContent = countdown;
            }
            
            if (countdown <= 0) {
                this.clearNextQuestionTimer();
                // Si aucune nouvelle question n'arrive, on peut rester sur les résultats
            }
        }, 1000);
    }

    clearNextQuestionTimer() {
        if (this.nextQuestionTimer) {
            clearInterval(this.nextQuestionTimer);
            this.nextQuestionTimer = null;
        }
    }

    handleNewQuestion(data) {
        this.clearNextQuestionTimer();
        window.app.screenManager.showScreen('game', data);
    }

    handleGameEnded(data) {
        this.clearNextQuestionTimer();
        window.app.screenManager.showScreen('final', data);
    }
}

// Créer une instance globale
window.resultsScreen = new ResultsScreen();