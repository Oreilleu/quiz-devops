// src/socket/gameHandlers.js
const QuestionService = require('../services/questionService');
const logger = require('../utils/logger');
const { GAME_CONFIG } = require('../utils/constants');

class GameHandlers {
    constructor(socket, io, rooms) {
        this.socket = socket;
        this.io = io;
        this.rooms = rooms;
        this.questionService = new QuestionService();
    }

    async handleStartGame(data) {
        try {
            const room = this.rooms.get(this.socket.roomName);

            if (!room) {
                this.socket.emit('error', { message: 'Salle introuvable' });
                return;
            }

            if (room.players.size < GAME_CONFIG.MIN_PLAYERS) {
                this.socket.emit('error', {
                    message: `Il faut au moins ${GAME_CONFIG.MIN_PLAYERS} joueurs pour commencer!`
                });
                return;
            }

            if (room.gameState !== 'waiting') {
                this.socket.emit('error', { message: 'La partie a déjà commencé' });
                return;
            }

            // Appliquer la configuration personnalisée
            if (data) {
                if (data.questionsCount) {
                    room.totalQuestions = parseInt(data.questionsCount);
                    logger.info(`Configuration: ${room.totalQuestions} questions`);
                }
                if (data.timePerQuestion) {
                    room.questionTimeLimit = parseInt(data.timePerQuestion);
                    logger.info(`Configuration: ${room.questionTimeLimit}s par question`);
                }
            }

            // Marquer le jeu comme démarré
            room.gameState = 'starting';

            // Notifier le démarrage avec compte à rebours
            this.io.to(this.socket.roomName).emit('game-starting', {
                countdown: GAME_CONFIG.GAME_START_COUNTDOWN
            });

            logger.info(`Jeu démarré dans la salle ${this.socket.roomName}`);

            // Générer les questions
            try {
                await room.generateQuestions();
                logger.info(`Questions générées pour la salle ${this.socket.roomName}`);
            } catch (error) {
                logger.error('Erreur génération questions:', error);
                room.questions = room.getFallbackQuestions();
            }

            // Démarrer après le compte à rebours
            setTimeout(() => {
                room.gameState = 'playing';
                room.startNextQuestion();
            }, GAME_CONFIG.GAME_START_COUNTDOWN * 1000);

        } catch (error) {
            logger.error('Erreur start game:', error);
            this.socket.emit('error', { message: 'Erreur lors du démarrage' });
        }
    }

    handleSubmitAnswer(data) {
        try {
            const room = this.rooms.get(this.socket.roomName);

            if (!room || room.gameState !== 'playing') {
                return;
            }

            const player = room.players.get(this.socket.id);
            if (!player || player.hasAnswered) {
                return;
            }

            // Enregistrer la réponse
            player.hasAnswered = true;
            player.answers[room.currentQuestion] = data.answer;
            player.answerTime = Date.now() - room.questionStartTime;

            logger.debug(`${player.username} a répondu: ${data.answer}`);

            // Notifier que le joueur a répondu
            this.socket.emit('answer-submitted', {
                success: true,
                answerTime: player.answerTime
            });

            // Vérifier si tous les joueurs ont répondu
            const allAnswered = Array.from(room.players.values())
                .every(p => p.hasAnswered);

            if (allAnswered) {
                logger.info(`Tous les joueurs ont répondu dans ${this.socket.roomName}`);
                room.processAnswers();
            }

        } catch (error) {
            logger.error('Erreur submit answer:', error);
        }
    }

    handleGetLeaderboard() {
        try {
            const room = this.rooms.get(this.socket.roomName);

            if (!room) {
                this.socket.emit('error', { message: 'Salle introuvable' });
                return;
            }

            const leaderboard = room.getLeaderboard();
            this.socket.emit('leaderboard-update', { leaderboard });

        } catch (error) {
            logger.error('Erreur get leaderboard:', error);
        }
    }

    handleGetGameStats() {
        try {
            const room = this.rooms.get(this.socket.roomName);

            if (!room) {
                this.socket.emit('error', { message: 'Salle introuvable' });
                return;
            }

            const stats = {
                currentQuestion: room.currentQuestion + 1,
                totalQuestions: room.questions.length,
                playersCount: room.players.size,
                gameState: room.gameState,
                category: room.category
            };

            this.socket.emit('game-stats', stats);

        } catch (error) {
            logger.error('Erreur get game stats:', error);
        }
    }
}

module.exports = GameHandlers;