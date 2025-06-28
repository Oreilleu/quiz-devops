class CountdownScreen {
    constructor() {
        this.isVisible = false;
        this.countdownTimer = null;
        this.currentCount = 3;
    }
    
    init() {
        // Initialize countdown screen
    }
    
    render(data = null) {
        this.countdownData = data || {};
        this.currentCount = data?.countdown || 3;

        return `
            <div class="screen countdown-screen">
                <div class="countdown-container">
                    <div class="countdown-header">
                        <h1><i class="fas fa-rocket"></i> Le quiz va commencer</h1>
                        <p>Préparez-vous, la première question arrive dans...</p>
                    </div>
                    
                    <div class="countdown-display">
                        <div class="countdown-number" id="countdown-number">${this.currentCount}</div>
                    </div>
                    
                    <div class="countdown-footer">
                        <div class="loading-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                        <p>Génération des questions en cours...</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    show(data = null) {
        this.isVisible = true;
        this.countdownData = data || this.countdownData;
        this.currentCount = data?.countdown || 3;
        
        this.setupEventListeners();
        this.startCountdown();
    }
    
    hide() {
        this.isVisible = false;
        this.clearCountdown();
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Remove any existing listeners first
        this.removeEventListeners();
        
        if (window.app?.socketManager) {
            
            // Store bound method for proper removal later
            this.boundHandlers = {
                newQuestion: this.handleQuestion.bind(this)
            };
            
            window.app.socketManager.on('socket:new-question', this.boundHandlers.newQuestion);
        }
    }

    removeEventListeners() {
        if (window.app?.socketManager && this.boundHandlers) {
            window.app.socketManager.off('socket:new-question', this.boundHandlers.newQuestion);
            this.boundHandlers = null;
        }
    }

    startCountdown() {
        const numberElement = document.getElementById('countdown-number');
        
        this.countdownTimer = setInterval(() => {
            this.currentCount--;
            
            if (numberElement) {
                numberElement.textContent = this.currentCount;
                numberElement.classList.add('animate-bounce');
                setTimeout(() => {
                    numberElement.classList.remove('animate-bounce');
                }, 500);
            }
            
            
            if (this.currentCount <= 0) {
                this.clearCountdown();
                // Attendre la première question ou transition automatique
                setTimeout(() => {
                    this.transitionToGame();
                }, 1000);
            }
        }, 1000);
    }

    clearCountdown() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    handleQuestion(data) {
        this.clearCountdown();
        window.app.screenManager.showScreen('game', data);
    }

    transitionToGame() {
        // Si aucune question n'est arrivée, on peut afficher un écran de transition
        window.app.screenManager.showScreen('game', { waiting: true });
    }
}