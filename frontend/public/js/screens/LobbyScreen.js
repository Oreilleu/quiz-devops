// public/js/screens/LobbyScreen.js
class LobbyScreen {
    constructor() {
        this.isVisible = false;
        this.players = [];
        this.roomData = null;
        this.isHost = false;
    }

    init() {
        // Initialisation des écouteurs
    }

    render(data = null) {
        this.roomData = data || {};
        this.isHost = data?.isHost || false;

        return `
            <div class="screen lobby-screen">
                <div class="lobby-header">
                    <div class="room-info-card">
                        <h2><i class="fas fa-users"></i> Salle : <span id="room-name">${this.roomData.roomName || ''}</span></h2>
                        <div class="room-details">
                            <div class="room-detail">
                                <i class="fas fa-tag"></i>
                                <span>Catégorie : <strong id="room-category">${this.roomData.category || ''}</strong></span>
                            </div>
                            <div class="room-detail">
                                <i class="fas fa-clock"></i>
                                <span>Créée à : <strong>${new Date().toLocaleTimeString()}</strong></span>
                            </div>
                            <div class="room-detail">
                                <i class="fas fa-share-alt"></i>
                                <button class="btn-link" onclick="lobbyScreen.shareRoom()">
                                    Partager la salle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lobby-content">
                    <div class="players-section">
                        <div class="players-header">
                            <h3>
                                <i class="fas fa-users"></i> 
                                Joueurs connectés (<span id="players-count">0</span>)
                            </h3>
                            <div class="players-actions">
                                ${this.isHost ? `
                                    <button class="btn btn-small btn-secondary" onclick="lobbyScreen.refreshPlayers()">
                                        <i class="fas fa-sync-alt"></i> Actualiser
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="players-grid" id="players-list">
                            <!-- Les joueurs seront injectés ici -->
                        </div>

                        <div class="players-info">
                            <p><i class="fas fa-info-circle"></i> Minimum 1 joueur requis pour commencer</p>
                        </div>
                    </div>

                    <div class="game-controls">
                        ${this.isHost ? `
                            <div class="host-controls">
                                <h3><i class="fas fa-crown"></i> Contrôles de l'hôte</h3>
                                <div class="control-group">
                                    <label for="questions-count">Nombre de questions :</label>
                                    <select id="questions-count">
                                        <option value="5">5 questions</option>
                                        <option value="10" selected>10 questions</option>
                                        <option value="15">15 questions</option>
                                        <option value="20">20 questions</option>
                                    </select>
                                </div>
                                
                                <div class="control-group">
                                    <label for="time-per-question">Temps par question :</label>
                                    <select id="time-per-question">
                                        <option value="10">10 secondes</option>
                                        <option value="15" selected>15 secondes</option>
                                        <option value="20">20 secondes</option>
                                        <option value="30">30 secondes</option>
                                    </select>
                                </div>
                            </div>
                        ` : `
                            <div class="waiting-message">
                                <i class="fas fa-hourglass-half"></i>
                                <h3>En attente de l'hôte</h3>
                                <p>L'hôte va bientôt lancer la partie...</p>
                            </div>
                        `}

                        <div class="action-buttons">
                            ${this.isHost ? `
                                <button class="btn btn-success btn-large" id="start-game-btn" onclick="lobbyScreen.startGame()" disabled>
                                    <i class="fas fa-rocket"></i>
                                    <span>Commencer le quiz</span>
                                    <div class="btn-loader" style="display: none;">
                                        <i class="fas fa-spinner fa-spin"></i>
                                    </div>
                                </button>
                            ` : ''}
                            
                            <button class="btn btn-secondary" onclick="lobbyScreen.leaveRoom()">
                                <i class="fas fa-door-open"></i> Quitter la salle
                            </button>
                        </div>
                    </div>
                </div>

                <div id="lobby-messages"></div>

                <!-- Chat de lobby (optionnel) -->
                <div class="lobby-chat" id="lobby-chat" style="display: none;">
                    <div class="chat-header">
                        <h4><i class="fas fa-comments"></i> Chat</h4>
                        <button class="btn-close" onclick="lobbyScreen.toggleChat()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chat-messages" id="chat-messages"></div>
                    <div class="chat-input">
                        <input type="text" id="chat-input-field" placeholder="Tapez votre message..." maxlength="200">
                        <button onclick="lobbyScreen.sendMessage()"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>

                <button class="chat-toggle" onclick="lobbyScreen.toggleChat()">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
        `;
    }

    show(data = null) {
        this.isVisible = true;
        this.roomData = data || this.roomData;

        // Mettre à jour les informations de la salle
        this.updateRoomInfo();

        // Mettre à jour la liste des joueurs
        if (data?.players) {
            this.updatePlayers(data.players);
        }

        this.setupEventListeners();
        this.checkStartGameConditions();
    }

    hide() {
        this.isVisible = false;
        this.removeEventListeners();
    }

    setupEventListeners() {
        // Remove any existing listeners first
        this.removeEventListeners();
        
        // Écouter les événements socket
        if (window.app?.socketManager) {
            
            // Store bound methods for proper removal later
            this.boundHandlers = {
                playerJoined: this.handlePlayerJoined.bind(this),
                playerLeft: this.handlePlayerLeft.bind(this),
                gameStarting: this.handleGameStarting.bind(this),
                error: this.handleError.bind(this)
            };
            
            window.app.socketManager.on('socket:player-joined', this.boundHandlers.playerJoined);
            window.app.socketManager.on('socket:player-left', this.boundHandlers.playerLeft);
            window.app.socketManager.on('socket:game-starting', this.boundHandlers.gameStarting);
            window.app.socketManager.on('socket:error', this.boundHandlers.error);
        }

        // Écouter les changements de configuration
        const questionsSelect = document.getElementById('questions-count');
        const timeSelect = document.getElementById('time-per-question');

        if (questionsSelect) {
            questionsSelect.addEventListener('change', this.updateGameConfig.bind(this));
        }

        if (timeSelect) {
            timeSelect.addEventListener('change', this.updateGameConfig.bind(this));
        }

        // Chat en temps réel
        const chatInput = document.getElementById('chat-input-field');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    removeEventListeners() {
        if (window.app?.socketManager) {
            // Store bound methods to ensure proper removal
            if (this.boundHandlers) {
                window.app.socketManager.off('socket:player-joined', this.boundHandlers.playerJoined);
                window.app.socketManager.off('socket:player-left', this.boundHandlers.playerLeft);
                window.app.socketManager.off('socket:game-starting', this.boundHandlers.gameStarting);
                window.app.socketManager.off('socket:error', this.boundHandlers.error);
                this.boundHandlers = null;
            }
        }
    }

    updateRoomInfo() {
        const roomNameEl = document.getElementById('room-name');
        const roomCategoryEl = document.getElementById('room-category');

        if (roomNameEl && this.roomData.roomName) {
            roomNameEl.textContent = this.roomData.roomName;
        }

        if (roomCategoryEl && this.roomData.category) {
            roomCategoryEl.textContent = CATEGORIES[this.roomData.category] || this.roomData.category;
        }
    }

    updatePlayers(players) {
        this.players = players;
        const container = document.getElementById('players-list');
        const countEl = document.getElementById('players-count');

        if (countEl) {
            countEl.textContent = players.length;
        }

        if (!container) return;

        container.innerHTML = players.map((player, index) => {
            const currentUser = window.app.getCurrentUser();
            const isCurrentUser = player.username === currentUser?.username;
            const isHost = index === 0; // Premier joueur = hôte

            return `
                <div class="player-card ${isCurrentUser ? 'current-user' : ''}" style="animation-delay: ${index * 0.1}s">
                    <div class="player-avatar">
                        <i class="fas ${isHost ? 'fa-crown' : 'fa-user'}"></i>
                    </div>
                    <div class="player-info">
                        <div class="player-name">
                            ${player.username}
                            ${isCurrentUser ? '<span class="badge">Vous</span>' : ''}
                            ${isHost ? '<span class="badge host">Hôte</span>' : ''}
                        </div>
                        <div class="player-status">
                            <i class="fas fa-circle online"></i> En ligne
                        </div>
                    </div>
                    <div class="player-actions">
                        ${this.isHost && !isCurrentUser ? `
                            <button class="btn-icon" onclick="lobbyScreen.kickPlayer('${player.username}')" title="Exclure">
                                <i class="fas fa-user-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        this.checkStartGameConditions();
    }

    checkStartGameConditions() {
        const startBtn = document.getElementById('start-game-btn');
        if (!startBtn) return;

        const canStart = this.players.length >= 1 && this.isHost;
        startBtn.disabled = !canStart;

        if (canStart) {
            startBtn.classList.add('btn-pulse');
        } else {
            startBtn.classList.remove('btn-pulse');
        }
    }

    startGame() {
        const startBtn = document.getElementById('start-game-btn');
        if (!startBtn || startBtn.disabled) return;

        // Afficher le loader
        this.setLoadingState(true);

        // Récupérer la configuration
        const questionsCount = document.getElementById('questions-count')?.value || 10;
        const timePerQuestion = document.getElementById('time-per-question')?.value || 15;

        // Envoyer la demande de démarrage
        const gameConfig = {
            questionsCount: parseInt(questionsCount),
            timePerQuestion: parseInt(timePerQuestion)
        };
        
        window.app.socketManager.startGame(gameConfig);

        this.showMessage('Démarrage du quiz...', 'info');
    }

    setLoadingState(loading) {
        const btn = document.getElementById('start-game-btn');
        if (!btn) return;

        const btnText = btn.querySelector('span');
        const btnLoader = btn.querySelector('.btn-loader');

        if (loading) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
        } else {
            this.checkStartGameConditions();
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    leaveRoom() {
        if (confirm('Êtes-vous sûr de vouloir quitter la salle ?')) {
            window.app.socketManager.leaveRoom();
            window.app.screenManager.showScreen('login');
        }
    }

    shareRoom() {
        const roomUrl = `${window.location.origin}?room=${encodeURIComponent(this.roomData.roomName)}`;

        if (Utils.copyToClipboard(roomUrl)) {
            this.showMessage('Lien de la salle copié !', 'success');
        } else {
            // Fallback : montrer le lien dans une modal
            prompt('Partagez ce lien avec vos amis :', roomUrl);
        }
    }

    refreshPlayers() {
        // Demander une mise à jour de la liste des joueurs
        window.app.socketManager.socket.emit('get-players');
        this.showMessage('Liste des joueurs actualisée', 'info');
    }

    kickPlayer(username) {
        if (confirm(`Êtes-vous sûr de vouloir exclure ${username} ?`)) {
            window.app.socketManager.socket.emit('kick-player', { username });
        }
    }

    toggleChat() {
        const chat = document.getElementById('lobby-chat');
        if (chat) {
            chat.style.display = chat.style.display === 'none' ? 'block' : 'none';

            if (chat.style.display === 'block') {
                document.getElementById('chat-input-field')?.focus();
            }
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input-field');
        const message = input?.value.trim();

        if (!message) return;

        // Envoyer le message via socket
        window.app.socketManager.socket.emit('chat-message', { message });

        // Ajouter à l'interface
        this.addChatMessage(window.app.getCurrentUser().username, message, true);

        input.value = '';
    }

    addChatMessage(username, message, isOwn = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const messageEl = Utils.createElement('div', `chat-message ${isOwn ? 'own' : ''}`, `
            <div class="message-author">${username}</div>
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `);

        container.appendChild(messageEl);
        container.scrollTop = container.scrollHeight;
    }

    updateGameConfig() {
        // Sauvegarder la configuration pour l'hôte
        const config = {
            questionsCount: document.getElementById('questions-count')?.value,
            timePerQuestion: document.getElementById('time-per-question')?.value
        };

        // Optionnel : envoyer au serveur pour synchroniser
        window.app.socketManager.socket.emit('update-game-config', config);
    }

    // Gestionnaires d'événements Socket
    handlePlayerJoined(data) {
        this.updatePlayers(data.players);
        this.showMessage(`${data.username} a rejoint la partie`, 'success');
    }

    handlePlayerLeft(data) {
        this.updatePlayers(data.players);
        this.showMessage(`${data.username} a quitté la partie`, 'warning');
    }

    handleGameStarting(data) {
        this.setLoadingState(false);
        this.showMessage('Le quiz va commencer !', 'success');

        setTimeout(() => {
            window.app.screenManager.showScreen('countdown', data);
        }, 1000);
    }

    handleError(error) {
        this.setLoadingState(false);
        this.showMessage(error.message || 'Une erreur est survenue', 'error');
    }

    showMessage(message, type = 'info') {
        if (window.app?.uiManager?.showNotification) {
            window.app.uiManager.showNotification(message, type);
        } else {
            // Fallback simple
            const container = document.getElementById('lobby-messages');
            if (container) {
                container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            }
        }
    }

    update(data) {
        if (data.players) {
            this.updatePlayers(data.players);
        }
    }
}

// Créer une instance globale
window.lobbyScreen = new LobbyScreen();