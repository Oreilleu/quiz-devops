class ScreenManager {
    constructor() {
        this.currentScreen = null;
        this.screens = new Map();
        this.container = null;
    }

    init() {
        this.container = document.getElementById('main-content');
        this.registerScreens();
    }

    registerScreens() {
        // Enregistrer tous les écrans disponibles
        this.screens.set('login', new LoginScreen());
        this.screens.set('lobby', new LobbyScreen());
        this.screens.set('countdown', new CountdownScreen());
        this.screens.set('game', new GameScreen());
        this.screens.set('results', new ResultsScreen());
        this.screens.set('final', new FinalScreen());

        // Initialiser chaque écran
        this.screens.forEach(screen => {
            screen.init();
        });
    }

    showScreen(screenName, data = null) {

        // Masquer l'écran actuel
        if (this.currentScreen) {
            this.currentScreen.hide();
        }

        // Afficher le nouveau écran
        const screen = this.screens.get(screenName);
        if (screen) {
            this.container.innerHTML = screen.render(data);
            screen.show(data);
            this.currentScreen = screen;

            // Ajouter la classe active pour rendre l'écran visible
            const screenElement = this.container.querySelector('.screen');
            if (screenElement) {
                screenElement.classList.add('active');
            }

            // Ajouter la classe pour l'animation
            this.container.classList.add('screen-transition');
            setTimeout(() => {
                this.container.classList.remove('screen-transition');
            }, 300);
        } else {
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    updateCurrentScreen(data) {
        if (this.currentScreen && this.currentScreen.update) {
            this.currentScreen.update(data);
        }
    }
}