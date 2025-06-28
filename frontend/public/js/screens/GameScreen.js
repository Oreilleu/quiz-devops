class GameScreen {
    constructor() {
        this.isVisible = false;
        this.currentQuestion = null;
        this.timeLeft = 0;
        this.timer = null;
        this.selectedAnswer = null;
        this.hasAnswered = false;
    }
    
    init() {
        // Initialize game screen
    }

    render(data = null) {
        this.currentQuestion = data || {};
        const isWaiting = data?.waiting || !data?.question;

        if (isWaiting) {
            return `
                <div class="screen game-screen">
                    <div class="game-container waiting">
                        <div class="waiting-message">
                            <i class="fas fa-hourglass-half fa-spin"></i>
                            <h2>Préparation de la question...</h2>
                            <p>La prochaine question arrive dans quelques instants</p>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="screen game-screen">
                <div class="game-container">
                    <div class="game-header">
                        <div class="question-progress">
                            <span class="question-number">Question ${this.currentQuestion.questionNumber || 1}</span>
                            <span class="question-total">sur ${this.currentQuestion.totalQuestions || 10}</span>
                        </div>
                        <div class="time-remaining" id="time-remaining">
                            <i class="fas fa-clock"></i>
                            <span id="timer-display">${this.currentQuestion.timeLimit || 15}</span>s
                        </div>
                    </div>

                    <div class="question-section">
                        <div class="question-text">
                            <h2>${this.currentQuestion.question || 'Chargement de la question...'}</h2>
                        </div>
                    </div>

                    <div class="answers-section">
                        <div class="answers-grid" id="answers-grid">
                            ${this.renderAnswers()}
                        </div>
                    </div>

                    <div class="game-footer">
                        <div class="answer-status" id="answer-status" style="display: none;">
                            <i class="fas fa-check-circle"></i>
                            <span>Réponse envoyée !</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnswers() {
        if (!this.currentQuestion.options) {
            return '<div class="loading">Chargement des réponses...</div>';
        }

        const answersHTML = this.currentQuestion.options.map((option, index) => `
            <button class="answer-btn" 
                    data-answer="${index}">
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${option}</span>
            </button>
        `).join('');
        
        return answersHTML;
    }

    show(data = null) {
        this.isVisible = true;
        this.currentQuestion = data || this.currentQuestion;
        this.hasAnswered = false;
        this.selectedAnswer = null;

        if (data && !data.waiting) {
            this.timeLeft = data.timeLimit || 15;
            this.startTimer();
        }

        this.setupEventListeners();
        this.setupAnswerClickHandlers();
    }

    hide() {
        this.isVisible = false;
        this.stopTimer();
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Remove any existing listeners first
        this.removeEventListeners();
        
        if (window.app?.socketManager) {
            
            // Store bound methods for proper removal later
            this.boundHandlers = {
                newQuestion: this.handleNewQuestion.bind(this),
                questionResults: this.handleQuestionResults.bind(this),
                answerSubmitted: this.handleAnswerSubmitted.bind(this),
                gameEnded: this.handleGameEnded.bind(this)
            };
            
            window.app.socketManager.on('socket:new-question', this.boundHandlers.newQuestion);
            window.app.socketManager.on('socket:question-results', this.boundHandlers.questionResults);
            window.app.socketManager.on('socket:answer-submitted', this.boundHandlers.answerSubmitted);
            window.app.socketManager.on('socket:game-ended', this.boundHandlers.gameEnded);
            window.app.socketManager.on('socket:game-finished', this.boundHandlers.gameEnded);
        }
    }

    removeEventListeners() {
        if (window.app?.socketManager && this.boundHandlers) {
            window.app.socketManager.off('socket:new-question', this.boundHandlers.newQuestion);
            window.app.socketManager.off('socket:question-results', this.boundHandlers.questionResults);
            window.app.socketManager.off('socket:answer-submitted', this.boundHandlers.answerSubmitted);
            window.app.socketManager.off('socket:game-ended', this.boundHandlers.gameEnded);
            window.app.socketManager.off('socket:game-finished', this.boundHandlers.gameEnded);
            this.boundHandlers = null;
        }
    }

    setupAnswerClickHandlers() {
        
        // Utiliser event delegation pour les boutons de réponse
        const container = document.querySelector('#main-content');
        if (container) {
            // Retirer les anciens event listeners
            container.removeEventListener('click', this.handleAnswerClick);
            
            // Ajouter le nouveau event listener
            this.handleAnswerClick = (event) => {
                const answerBtn = event.target.closest('.answer-btn');
                if (answerBtn) {
                    const answerIndex = parseInt(answerBtn.getAttribute('data-answer'));
                    this.selectAnswer(answerIndex);
                }
            };
            
            container.addEventListener('click', this.handleAnswerClick);
        } else {
        }
    }

    selectAnswer(answerIndex) {
        
        if (this.hasAnswered) {
            return;
        }

        this.selectedAnswer = answerIndex;
        this.hasAnswered = true;

        // Marquer visuellement la réponse sélectionnée
        const buttons = document.querySelectorAll('.answer-btn');
        
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === answerIndex) {
                btn.classList.add('selected');
            } else {
                btn.classList.add('disabled');
            }
        });

        // Vérifier que le SocketManager existe
        if (!window.app?.socketManager) {
            return;
        }

        // Envoyer la réponse
        window.app.socketManager.submitAnswer(answerIndex);

        // Afficher le status
        const statusEl = document.getElementById('answer-status');
        if (statusEl) {
            statusEl.style.display = 'flex';
        } else {
        }

    }

    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                if (!this.hasAnswered) {
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('timer-display');
        if (timerEl) {
            timerEl.textContent = this.timeLeft;
            
            // Ajouter des classes CSS pour l'urgence
            const timeContainer = document.getElementById('time-remaining');
            if (timeContainer) {
                if (this.timeLeft <= 5) {
                    timeContainer.classList.add('urgent');
                } else if (this.timeLeft <= 10) {
                    timeContainer.classList.add('warning');
                }
            }
        }
    }

    handleNewQuestion(data) {
        
        this.currentQuestion = data;
        this.hasAnswered = false;
        this.selectedAnswer = null;
        this.timeLeft = data.timeLimit || 15;

        // Refresh the screen with new question
        const container = document.querySelector('#main-content');
        if (container) {
            const newHTML = this.render(data);
            container.innerHTML = newHTML;
            
            // Make sure the screen is visible
            const screenElement = container.querySelector('.screen');
            if (screenElement) {
                screenElement.classList.add('active');
            }
            
            // Setup click handlers for the new question
            this.setupAnswerClickHandlers();
            
            this.startTimer();
        } else {
        }
    }

    handleQuestionResults(data) {
        this.stopTimer();
        
        // Ne pas afficher les résultats individuels, juste attendre la prochaine question
        // ou la fin du jeu
    }

    handleAnswerSubmitted(data) {
    }

    handleGameEnded(data) {
        this.stopTimer();
        // Aller directement aux résultats finaux
        window.app.screenManager.showScreen('final', data);
    }
}

// Créer une instance globale
window.gameScreen = new GameScreen();