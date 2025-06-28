// src/socket/roomHandlers.js
const Game = require('../models/Game');
const Player = require('../models/Player');
const logger = require('../utils/logger');

class RoomHandlers {
    constructor(socket, io, rooms) {
        this.socket = socket;
        this.io = io;
        this.rooms = rooms;
    }

    async handleJoinRoom(data) {
        try {
            const { roomName, username, category } = data;

            // Validation des données
            if (!roomName || !username) {
                this.socket.emit('error', { message: 'Nom de salle et pseudo requis' });
                return;
            }

            if (username.length > 20 || roomName.length > 20) {
                this.socket.emit('error', { message: 'Nom trop long (max 20 caractères)' });
                return;
            }

            // Créer ou rejoindre la salle
            if (!this.rooms.has(roomName)) {
                const QuizRoom = require('./quizRoom');
                this.rooms.set(roomName, new QuizRoom(roomName, category || 'général', this.io));
                logger.info(`Nouvelle salle créée: ${roomName}`);
            }

            const room = this.rooms.get(roomName);

            // Vérifier si la partie a déjà commencé
            if (room.gameState === 'playing') {
                this.socket.emit('error', { message: 'La partie a déjà commencé!' });
                return;
            }

            // Vérifier si le pseudo est déjà pris
            const existingPlayer = Array.from(room.players.values())
                .find(player => player.username === username);

            if (existingPlayer) {
                this.socket.emit('error', { message: 'Ce pseudo est déjà pris!' });
                return;
            }

            // Ajouter le joueur à la salle
            room.addPlayer(this.socket.id, username);
            this.socket.join(roomName);
            this.socket.roomName = roomName;
            this.socket.username = username;

            // Notifier tous les joueurs de la salle
            this.io.to(roomName).emit('player-joined', {
                username,
                players: room.getPlayersList(),
                playersCount: room.players.size
            });

            // Confirmer la connexion au joueur
            this.socket.emit('joined-room', {
                roomName,
                category: room.category,
                players: room.getPlayersList(),
                isHost: room.players.size === 1 // Premier joueur = host
            });

            logger.info(`${username} a rejoint la salle ${roomName}`);

        } catch (error) {
            logger.error('Erreur join room:', error);
            this.socket.emit('error', { message: 'Erreur lors de la connexion' });
        }
    }

    handleLeaveRoom() {
        if (this.socket.roomName) {
            this.removePlayerFromRoom();
        }
    }

    handleDisconnect() {
        if (this.socket.roomName) {
            this.removePlayerFromRoom();
            logger.info(`${this.socket.username || this.socket.id} s'est déconnecté`);
        }
    }

    removePlayerFromRoom() {
        const roomName = this.socket.roomName;
        const room = this.rooms.get(roomName);

        if (room) {
            const username = this.socket.username;
            room.removePlayer(this.socket.id);

            if (room.players.size === 0) {
                // Supprimer la salle si elle est vide
                this.rooms.delete(roomName);
                logger.info(`Salle ${roomName} supprimée (vide)`);
            } else {
                // Notifier les autres joueurs
                this.io.to(roomName).emit('player-left', {
                    username,
                    players: room.getPlayersList(),
                    playersCount: room.players.size
                });
            }

            this.socket.leave(roomName);
            this.socket.roomName = null;
            this.socket.username = null;
        }
    }
}

module.exports = RoomHandlers;