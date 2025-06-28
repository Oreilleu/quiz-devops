class QuizApp {
    constructor() {
        this.socketManager = new SocketManager();
        this.screenManager = new ScreenManager();
        this.uiManager = new UIManager();

        this.currentUser = null;
        this.currentRoom = null;

        this.init();
    }

    init() {

        // Initialiser les gestionnaires
        this.socketManager.init();
        this.screenManager.init();
        this.uiManager.init();

        // Afficher l'écran de connexion
        this.screenManager.showScreen('login');

        // Écouter les événements globaux
        this.setupGlobalEvents();
    }

    setupGlobalEvents() {
        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            this.uiManager.showNotification('Une erreur est survenue', 'error');
        });

        // Gestion de la déconnexion
        window.addEventListener('beforeunload', () => {
            if (this.currentRoom) {
                this.socketManager.leaveRoom();
            }
        });
    }

    // Méthodes publiques pour les autres composants
    setCurrentUser(user) {
        this.currentUser = user;
    }

    setCurrentRoom(room) {
        this.currentRoom = room;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentRoom() {
        return this.currentRoom;
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuizApp();
});