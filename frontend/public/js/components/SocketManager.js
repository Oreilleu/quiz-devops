class SocketManager {
    constructor() {
        this.socket = null;
        this.serverUrl = CONFIG.SERVER_URL;
        this.eventHandlers = new Map();
    }

    init() {
        // Wait for Socket.IO to load
        if (typeof io === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        this.connect();
        this.setupDefaultHandlers();
    }

    connect() {
        try {
            if (typeof io === 'undefined') {
                throw new Error('Socket.IO library not loaded');
            }
            this.socket = io(this.serverUrl);

            this.socket.on('connect', () => {
                this.emit('app:connected');
            });

            this.socket.on('disconnect', () => {
                this.emit('app:disconnected');
            });

            this.socket.on('connect_error', (error) => {
                this.emit('app:connection-error', error);
            });

        } catch (error) {
        }
    }

    setupDefaultHandlers() {
        // Gestion des erreurs du serveur
        this.socket.on('error', (data) => {
            this.emit('socket:error', data);
        });

        // Gestion des événements de salle
        this.socket.on('joined-room', (data) => {
            this.emit('socket:joined-room', data);
        });

        this.socket.on('player-joined', (data) => {
            this.emit('socket:player-joined', data);
        });

        this.socket.on('player-left', (data) => {
            this.emit('socket:player-left', data);
        });

        // Gestion des événements de jeu
        this.socket.on('game-starting', (data) => {
            this.emit('socket:game-starting', data);
        });

        this.socket.on('new-question', (data) => {
            this.emit('socket:new-question', data);
        });

        this.socket.on('question-results', (data) => {
            this.emit('socket:question-results', data);
        });

        this.socket.on('game-finished', (data) => {
            this.emit('socket:game-finished', data);
        });

        this.socket.on('game-ended', (data) => {
            this.emit('socket:game-ended', data);
        });

        this.socket.on('answer-submitted', (data) => {
            this.emit('socket:answer-submitted', data);
        });
    }

    // Méthodes pour émettre des événements
    joinRoom(roomData) {
        this.socket.emit('join-room', roomData);
    }

    startGame(config = {}) {
        this.socket.emit('start-game', config);
    }

    submitAnswer(answer) {
        this.socket.emit('submit-answer', { answer });
    }

    leaveRoom() {
        this.socket.emit('leave-room');
    }

    // Système d'événements personnalisé
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data = null) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                }
            });
        }
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
}