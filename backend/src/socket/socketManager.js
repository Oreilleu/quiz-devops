const GameHandlers = require('./gameHandlers');
const RoomHandlers = require('./roomHandlers');
const logger = require('../utils/logger');

class SocketManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map();
        this.setupHandlers();
    }

    setupHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`Nouvelle connexion: ${socket.id}`);

            // Gestionnaires de salles
            const roomHandlers = new RoomHandlers(socket, this.io, this.rooms);
            socket.on('join-room', (data) => roomHandlers.handleJoinRoom(data));
            socket.on('leave-room', () => roomHandlers.handleLeaveRoom());

            // Gestionnaires de jeu
            const gameHandlers = new GameHandlers(socket, this.io, this.rooms);
            socket.on('start-game', (data) => gameHandlers.handleStartGame(data));
            socket.on('submit-answer', (data) => gameHandlers.handleSubmitAnswer(data));
            socket.on('get-leaderboard', () => gameHandlers.handleGetLeaderboard());

            // Déconnexion
            socket.on('disconnect', () => {
                logger.info(`Déconnexion: ${socket.id}`);
                roomHandlers.handleDisconnect();
            });

            // Gestion des erreurs
            socket.on('error', (error) => {
                logger.error(`Erreur socket ${socket.id}:`, error);
            });
        });
    }
}

function initSocketHandlers(io) {
    return new SocketManager(io);
}

module.exports = { SocketManager, initSocketHandlers };