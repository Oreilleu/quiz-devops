// public/js/screens/LoginScreen.js - Écran de connexion complet
class LoginScreen {
    constructor() {
        this.isVisible = false;
        this.form = null;
        this.validationRules = {};
    }

    init() {
        // Récupérer les données sauvegardées
        this.savedUsername = Utils.getLocalStorage('quiz_username', '');
        this.savedRoomName = Utils.getLocalStorage('quiz_room_name', '');
        this.savedCategory = Utils.getLocalStorage('quiz_category', 'général');

        // Vérifier s'il y a des paramètres URL
        this.checkUrlParameters();
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomFromUrl = urlParams.get('room');

        if (roomFromUrl) {
            this.savedRoomName = decodeURIComponent(roomFromUrl);
            // Effacer l'URL pour plus de propreté
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    render(data = null) {
        return `
            <div class="screen login-screen">
                <div class="login-form animate-fade-in">
                    <div class="form-header">
                        <h2><i class="fas fa-sign-in-alt"></i> Rejoindre une partie</h2>
                        <p>Entrez vos informations pour commencer à jouer</p>
                    </div>

                    <form id="login-form" class="form">
                        <div class="form-group">
                            <label for="username">
                                <i class="fas fa-user"></i> Nom d'utilisateur
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username"
                                placeholder="Votre pseudo unique" 
                                maxlength="${CONFIG.MAX_USERNAME_LENGTH}"
                                value="${this.savedUsername}"
                                required
                                autocomplete="username"
                                spellcheck="false"
                            >
                            <div class="input-feedback" id="username-feedback"></div>
                            <div class="input-helper">
                                <small><i class="fas fa-info-circle"></i> Entre 2 et 20 caractères (lettres, chiffres, _ et - seulement)</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="room-name">
                                <i class="fas fa-door-open"></i> Nom de la salle
                            </label>
                            <div class="input-group">
                                <input 
                                    type="text" 
                                    id="room-name" 
                                    name="roomName"
                                    placeholder="Nom de la salle ou créez-en une" 
                                    maxlength="${CONFIG.MAX_ROOM_NAME_LENGTH}"
                                    value="${this.savedRoomName}"
                                    required
                                    spellcheck="false"
                                >
                                <button type="button" class="btn-icon" title="Générer un nom aléatoire">
                                    <i class="fas fa-dice"></i>
                                </button>
                            </div>
                            <div class="input-feedback" id="room-feedback"></div>
                            <div class="input-helper">
                                <small><i class="fas fa-info-circle"></i> Si la salle n'existe pas, elle sera créée automatiquement</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="category">
                                <i class="fas fa-tags"></i> Catégorie du quiz
                            </label>
                            <select id="category" name="category" required>
                                ${Object.entries(CATEGORIES).map(([key, value]) =>
            `<option value="${key}" ${key === this.savedCategory ? 'selected' : ''}>${value}</option>`
        ).join('')}
                            </select>
                            <div class="input-helper">
                                <small><i class="fas fa-lightbulb"></i> Choisissez votre domaine de prédilection</small>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-large" id="join-btn">
                                <i class="fas fa-rocket"></i>
                                <span>Rejoindre la salle</span>
                                <div class="btn-loader" style="display: none;">
                                    <i class="fas fa-spinner fa-spin"></i>
                                </div>
                            </button>
                        </div>
                    </form>


                    <div id="recent-rooms" class="recent-rooms" style="display: none;">
                        <h4><i class="fas fa-clock"></i> Salles récentes</h4>
                        <div id="recent-rooms-list"></div>
                    </div>

                    <div id="login-messages"></div>
                </div>

                <div class="app-info animate-fade-in animate-delay-200">
                    <div class="info-card">
                        <h3><i class="fas fa-gamepad"></i> Comment jouer ?</h3>
                        <div class="info-steps">
                            <div class="info-step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h4>Choisissez un pseudo</h4>
                                    <p>Unique et mémorable pour vos adversaires</p>
                                </div>
                            </div>
                            <div class="info-step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h4>Créez ou rejoignez une salle</h4>
                                    <p>Partagez le nom avec vos amis</p>
                                </div>
                            </div>
                            <div class="info-step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h4>Répondez rapidement</h4>
                                    <p>Plus vous êtes rapide, plus vous gagnez de points</p>
                                </div>
                            </div>
                            <div class="info-step">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h4>Remportez la victoire</h4>
                                    <p>Soyez le meilleur et montez sur le podium</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="info-card features-card">
                        <h3><i class="fas fa-star"></i> Fonctionnalités</h3>
                        <div class="features-grid">
                            <div class="feature">
                                <i class="fas fa-bolt"></i>
                                <span>Temps réel</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-users"></i>
                                <span>Multijoueur</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-brain"></i>
                                <span>Questions IA</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-trophy"></i>
                                <span>Classements</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-mobile-alt"></i>
                                <span>Mobile friendly</span>
                            </div>
                            <div class="feature">
                                <i class="fas fa-palette"></i>
                                <span>Interface moderne</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    show(data = null) {
        this.isVisible = true;

        // Add active class to make screen visible
        const screen = document.querySelector('.screen.login-screen');
        if (screen) {
            screen.classList.add('active');
        }

        this.setupValidation();
        this.setupEventListeners();
        this.updateConnectionStatus();

        // Focus sur le premier champ vide après un délai pour l'animation
        setTimeout(() => {
            const usernameInput = document.getElementById('username');
            const roomInput = document.getElementById('room-name');

            if (!usernameInput.value) {
                usernameInput.focus();
            } else if (!roomInput.value) {
                roomInput.focus();
            }
        }, 300);

        // Charger les salles récentes
        this.loadRecentRooms();
    }

    hide() {
        this.isVisible = false;
        this.removeEventListeners();
    }

    setupEventListeners() {
        this.form = document.getElementById('login-form');

        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Validation en temps réel
        const usernameInput = document.getElementById('username');
        const roomInput = document.getElementById('room-name');
        const categorySelect = document.getElementById('category');

        if (usernameInput) {
            usernameInput.addEventListener('input', Utils.debounce(this.validateUsername.bind(this), 300));
            usernameInput.addEventListener('blur', this.validateUsername.bind(this));
            usernameInput.addEventListener('focus', this.clearValidation.bind(this, 'username'));
        }

        if (roomInput) {
            roomInput.addEventListener('input', Utils.debounce(this.validateRoomName.bind(this), 300));
            roomInput.addEventListener('blur', this.validateRoomName.bind(this));
            roomInput.addEventListener('focus', this.clearValidation.bind(this, 'room'));
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', this.saveCategory.bind(this));
        }

        // Button événements
        const randomRoomBtn = document.querySelector('.btn-icon[title="Générer un nom aléatoire"]');
        if (randomRoomBtn) {
            randomRoomBtn.addEventListener('click', this.generateRandomRoom.bind(this));
        }


        // Écouter les événements du socket
        this.setupSocketEventListeners();

        // Raccourcis clavier
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    setupSocketEventListeners() {
        if (window.app?.socketManager) {

            // Remove any existing listeners first
            this.removeSocketEventListeners();

            // Store bound methods for proper removal later
            this.boundSocketHandlers = {
                joinedRoom: this.handleJoinSuccess.bind(this),
                error: this.handleJoinError.bind(this),
                connected: this.handleConnectionChange.bind(this),
                disconnected: this.handleConnectionChange.bind(this),
                connectionError: this.handleConnectionError.bind(this)
            };

            window.app.socketManager.on('socket:joined-room', this.boundSocketHandlers.joinedRoom);
            window.app.socketManager.on('socket:error', this.boundSocketHandlers.error);
            window.app.socketManager.on('app:connected', this.boundSocketHandlers.connected);
            window.app.socketManager.on('app:disconnected', this.boundSocketHandlers.disconnected);
            window.app.socketManager.on('app:connection-error', this.boundSocketHandlers.connectionError);
        } else {
            // Retry après un délai
            setTimeout(() => this.setupSocketEventListeners(), 100);
        }
    }

    removeEventListeners() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleSubmit.bind(this));
        }

        this.removeSocketEventListeners();
        document.removeEventListener('keydown', this.handleKeyboard.bind(this));
    }

    removeSocketEventListeners() {
        if (window.app?.socketManager && this.boundSocketHandlers) {
            window.app.socketManager.off('socket:joined-room', this.boundSocketHandlers.joinedRoom);
            window.app.socketManager.off('socket:error', this.boundSocketHandlers.error);
            window.app.socketManager.off('app:connected', this.boundSocketHandlers.connected);
            window.app.socketManager.off('app:disconnected', this.boundSocketHandlers.disconnected);
            window.app.socketManager.off('app:connection-error', this.boundSocketHandlers.connectionError);
            this.boundSocketHandlers = null;
        }
    }

    setupValidation() {
        this.validationRules = {
            username: (value) => Utils.validateUsername(value),
            roomName: (value) => Utils.validateRoomName(value)
        };
    }

    validateUsername() {
        const input = document.getElementById('username');
        const feedback = document.getElementById('username-feedback');

        if (!input || !feedback) return false;

        const validation = this.validationRules.username(input.value);

        this.updateFieldValidation(input, feedback, validation);
        return validation.valid;
    }

    validateRoomName() {
        const input = document.getElementById('room-name');
        const feedback = document.getElementById('room-feedback');

        if (!input || !feedback) return false;

        const validation = this.validationRules.roomName(input.value);

        this.updateFieldValidation(input, feedback, validation);
        return validation.valid;
    }

    updateFieldValidation(input, feedback, validation) {
        if (validation.valid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            feedback.textContent = '';
            feedback.className = 'input-feedback';
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            feedback.textContent = validation.error;
            feedback.className = 'input-feedback error';
        }
    }

    clearValidation(field) {
        const input = document.getElementById(field === 'username' ? 'username' : 'room-name');
        const feedback = document.getElementById(field === 'username' ? 'username-feedback' : 'room-feedback');

        if (input) {
            input.classList.remove('valid', 'invalid');
        }
        if (feedback) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(this.form);
        const data = {
            username: formData.get('username').trim(),
            roomName: formData.get('roomName').trim(),
            category: formData.get('category')
        };

        // Validation complète
        const isUsernameValid = this.validateUsername();
        const isRoomNameValid = this.validateRoomName();

        if (!isUsernameValid || !isRoomNameValid) {
            this.showMessage('Veuillez corriger les erreurs avant de continuer', 'error');
            // Focus sur le premier champ invalide
            const invalidField = document.querySelector('.invalid');
            if (invalidField) invalidField.focus();
            return;
        }

        // Vérifier la connexion
        if (!this.isConnected()) {
            this.showMessage('Connexion au serveur en cours...', 'warning');
            return;
        }

        // Sauvegarder les données
        this.saveUserData(data);

        // Désactiver le bouton et montrer le loader
        this.setLoadingState(true);

        // Envoyer la demande de connexion
        window.app.socketManager.joinRoom(data);

        // Sauvegarder les données utilisateur dans l'app
        window.app.setCurrentUser({
            username: data.username,
            roomName: data.roomName,
            category: data.category
        });

        this.showMessage('Connexion à la salle...', 'info');
    }

    handleJoinSuccess(data) {
        this.setLoadingState(false);

        // Sauvegarder la salle dans l'historique
        this.addToRecentRooms(data.roomName, data.category);

        // Rediriger vers le lobby immédiatement
        console.log('🏃 Redirection vers lobby...');
        window.app.screenManager.showScreen('lobby', data);
    }

    handleJoinError(error) {
        this.setLoadingState(false);
        this.showMessage(error.message || 'Erreur de connexion', 'error');

        // Re-focus sur les champs si nécessaire
        if (error.message && error.message.includes('pseudo')) {
            document.getElementById('username')?.focus();
        } else if (error.message && error.message.includes('salle')) {
            document.getElementById('room-name')?.focus();
        }
    }

    handleConnectionChange() {
        this.updateConnectionStatus();
    }

    handleConnectionError(error) {
        this.updateConnectionStatus();
        this.showMessage('Erreur de connexion au serveur', 'error');
    }

    handleKeyboard(event) {
        if (!this.isVisible) return;

        // Ctrl/Cmd + Enter pour soumettre
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.form?.requestSubmit();
        }

        // Échap pour effacer les champs
        if (event.key === 'Escape') {
            this.clearAllFields();
        }
    }

    setLoadingState(loading) {
        const btn = document.getElementById('join-btn');
        const btnText = btn?.querySelector('span');
        const btnLoader = btn?.querySelector('.btn-loader');

        if (!btn) return;

        if (loading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
            btn.classList.add('loading');
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            btn.classList.remove('loading');
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('login-messages');
        if (!container) return;

        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-circle',
            'info': 'fa-info-circle'
        };

        const messageElement = Utils.createElement('div', `alert alert-${type} animate-slide-down`, `
            <i class="fas ${iconMap[type]}"></i>
            ${message}
        `);

        container.innerHTML = '';
        container.appendChild(messageElement);

        // Faire disparaître après 5 secondes sauf pour les erreurs
        if (type !== 'error') {
            setTimeout(() => {
                Utils.fadeOut(messageElement);
            }, 5000);
        }
    }

    generateRandomRoom() {
        const adjectives = ['Cool', 'Super', 'Mega', 'Ultra', 'Epic', 'Fun', 'Smart', 'Quick', 'Pro', 'Elite'];
        const nouns = ['Quiz', 'Game', 'Battle', 'Challenge', 'Arena', 'Zone', 'Room', 'Club', 'Squad', 'Team'];

        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 999) + 1;

        const roomName = `${randomAdjective}${randomNoun}${randomNumber}`;

        const roomInput = document.getElementById('room-name');
        if (roomInput) {
            roomInput.value = roomName;
            roomInput.classList.add('animate-pulse');
            setTimeout(() => roomInput.classList.remove('animate-pulse'), 600);
            this.validateRoomName();
        }
    }

    joinRandomRoom() {
        // Générer des données aléatoires
        this.generateRandomRoom();

        const usernameInput = document.getElementById('username');
        if (usernameInput && !usernameInput.value) {
            const randomUsernames = ['Joueur', 'Gamer', 'Pro', 'Ninja', 'Master', 'Champion'];
            const randomUsername = randomUsernames[Math.floor(Math.random() * randomUsernames.length)] +
                Math.floor(Math.random() * 9999);
            usernameInput.value = randomUsername;
            this.validateUsername();
        }

        // Soumettre automatiquement après un délai
        setTimeout(() => {
            if (this.validateUsername() && this.validateRoomName()) {
                this.form?.requestSubmit();
            }
        }, 500);
    }

    clearSavedData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données sauvegardées ?')) {
            Utils.setLocalStorage('quiz_username', '');
            Utils.setLocalStorage('quiz_room_name', '');
            Utils.setLocalStorage('quiz_category', 'général');
            Utils.setLocalStorage('quiz_recent_rooms', []);

            this.clearAllFields();
            this.showMessage('Toutes les données ont été effacées', 'success');
        }
    }

    clearAllFields() {
        const usernameInput = document.getElementById('username');
        const roomInput = document.getElementById('room-name');
        const categorySelect = document.getElementById('category');

        if (usernameInput) {
            usernameInput.value = '';
            usernameInput.classList.remove('valid', 'invalid');
        }

        if (roomInput) {
            roomInput.value = '';
            roomInput.classList.remove('valid', 'invalid');
        }

        if (categorySelect) {
            categorySelect.value = 'général';
        }

        // Effacer les feedbacks
        this.clearValidation('username');
        this.clearValidation('room');
    }

    saveUserData(data) {
        Utils.setLocalStorage('quiz_username', data.username);
        Utils.setLocalStorage('quiz_room_name', data.roomName);
        Utils.setLocalStorage('quiz_category', data.category);
    }

    saveCategory() {
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            Utils.setLocalStorage('quiz_category', categorySelect.value);
        }
    }

    updateConnectionStatus() {
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');

        if (!statusIcon || !statusText) return;

        const isConnected = this.isConnected();

        if (isConnected) {
            statusIcon.className = 'fas fa-circle online';
            statusText.textContent = 'Connecté au serveur';
        } else {
            statusIcon.className = 'fas fa-circle offline';
            statusText.textContent = 'Connexion au serveur...';
        }
    }

    isConnected() {
        return window.app?.socketManager?.socket?.connected || false;
    }

    loadRecentRooms() {
        const recentRooms = Utils.getLocalStorage('quiz_recent_rooms', []);
        const container = document.getElementById('recent-rooms-list');

        if (!container || recentRooms.length === 0) return;

        container.innerHTML = recentRooms.slice(0, 5).map(room => `
            <button class="recent-room-item" onclick="loginScreen.joinRecentRoom('${room.name}', '${room.category}')">
                <div class="room-info">
                    <span class="room-name">${room.name}</span>
                    <span class="room-category">${CATEGORIES[room.category] || room.category}</span>
                </div>
                <div class="room-date">${new Date(room.date).toLocaleDateString()}</div>
            </button>
        `).join('');
    }

    showRecentRooms() {
        const recentRoomsDiv = document.getElementById('recent-rooms');
        if (recentRoomsDiv) {
            const isVisible = recentRoomsDiv.style.display !== 'none';
            recentRoomsDiv.style.display = isVisible ? 'none' : 'block';

            if (!isVisible) {
                this.loadRecentRooms();
            }
        }
    }

    joinRecentRoom(roomName, category) {
        const roomInput = document.getElementById('room-name');
        const categorySelect = document.getElementById('category');

        if (roomInput) roomInput.value = roomName;
        if (categorySelect) categorySelect.value = category;

        this.validateRoomName();
        this.hideRecentRooms();
    }

    hideRecentRooms() {
        const recentRoomsDiv = document.getElementById('recent-rooms');
        if (recentRoomsDiv) {
            recentRoomsDiv.style.display = 'none';
        }
    }

    addToRecentRooms(roomName, category) {
        const recentRooms = Utils.getLocalStorage('quiz_recent_rooms', []);

        // Supprimer si déjà présent
        const filtered = recentRooms.filter(room => room.name !== roomName);

        // Ajouter en premier
        filtered.unshift({
            name: roomName,
            category: category,
            date: new Date().toISOString()
        });

        // Garder seulement les 10 plus récents
        const limited = filtered.slice(0, 10);

        Utils.setLocalStorage('quiz_recent_rooms', limited);
    }
}

// Créer une instance globale pour les onclick
window.loginScreen = new LoginScreen();