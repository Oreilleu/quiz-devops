// src/models/QuizRoom.js
const Game = require('../models/Game');
const Player = require('../models/Player');
const QuestionService = require('../services/questionService');
const logger = require('../utils/logger');
const { GAME_CONFIG, FALLBACK_QUESTIONS } = require('../utils/constants');

class QuizRoom {
    constructor(roomName, category = 'général', io = null) {
        this.roomName = roomName;
        this.players = new Map();
        this.questions = [];
        this.currentQuestion = 0;
        this.gameState = 'waiting'; // waiting, starting, playing, finished
        this.category = category;
        this.timer = null;
        this.questionTimeLimit = GAME_CONFIG.QUESTION_TIME_LIMIT;
        this.totalQuestions = GAME_CONFIG.DEFAULT_QUESTIONS;
        this.gameId = null;
        this.questionStartTime = null;
        this.gameStartTime = null;
        this.questionService = new QuestionService();
        this.io = io;
    }

    addPlayer(socketId, username) {
        this.players.set(socketId, {
            socketId,
            username,
            score: 0,
            correctAnswers: 0,
            hasAnswered: false,
            answers: [],
            answerTime: 0,
            joinedAt: new Date()
        });
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
    }

    getPlayersList() {
        return Array.from(this.players.values()).map(player => ({
            username: player.username,
            score: player.score,
            isOnline: true
        }));
    }

    async generateQuestions() {
        try {
            logger.info(`Génération de ${this.totalQuestions} questions pour la catégorie: ${this.category}`);

            this.questions = await this.questionService.generateQuestions(
                this.category,
                this.totalQuestions
            );

            if (this.questions.length === 0) {
                throw new Error('Aucune question générée');
            }

            // Sauvegarder la partie en base de données
            await this.saveGameToDatabase();

            logger.info(`${this.questions.length} questions générées avec succès`);

        } catch (error) {
            logger.error('Erreur génération questions:', error);
            this.questions = this.getFallbackQuestions();
            await this.saveGameToDatabase();
        }
    }

    getFallbackQuestions() {
        const categoryQuestions = FALLBACK_QUESTIONS[this.category] || FALLBACK_QUESTIONS.général;
        return categoryQuestions.slice(0, this.totalQuestions);
    }

    async saveGameToDatabase() {
        try {
            const game = await Game.create(
                this.roomName,
                this.category,
                this.players.size,
                this.questions.length
            );

            this.gameId = game.id;
            logger.info(`Partie sauvegardée avec l'ID: ${this.gameId}`);

        } catch (error) {
            logger.error('Erreur sauvegarde partie:', error);
        }
    }

    startNextQuestion() {
        // Set game start time on first question
        if (this.currentQuestion === 0 && !this.gameStartTime) {
            this.gameStartTime = Date.now();
        }

        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        // Reset des réponses pour la question suivante
        this.players.forEach(player => {
            player.hasAnswered = false;
        });

        const question = this.questions[this.currentQuestion];
        const questionData = {
            question: question.question,
            options: question.options,
            questionNumber: this.currentQuestion + 1,
            totalQuestions: this.questions.length,
            timeLimit: this.questionTimeLimit
        };

        // Marquer le début de la question
        this.questionStartTime = Date.now();

        // Envoyer la question à tous les joueurs
        if (this.io) {
            this.io.to(this.roomName).emit('new-question', questionData);
        }

        logger.info(`Question ${this.currentQuestion + 1}/${this.questions.length} envoyée dans ${this.roomName}`);

        // Timer pour la question
        this.timer = setTimeout(() => {
            this.processAnswers();
        }, this.questionTimeLimit * 1000);
    }

    processAnswers() {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        const question = this.questions[this.currentQuestion];
        const results = [];

        // Traiter les réponses de chaque joueur
        this.players.forEach((player, socketId) => {
            const playerAnswer = player.answers[this.currentQuestion];
            const isCorrect = playerAnswer === question.correct;

            // Calcul du score avec bonus de vitesse
            let points = 0;
            if (isCorrect) {
                const basePoints = 100;
                const timeBonus = Math.max(0, (this.questionTimeLimit * 1000 - player.answerTime) / 100);
                points = Math.round(basePoints + timeBonus);
                player.score += points;
                player.correctAnswers += 1; // Incrémenter le compteur de bonnes réponses
            }

            results.push({
                username: player.username,
                answer: playerAnswer,
                isCorrect,
                points,
                totalScore: player.score,
                correctAnswers: player.correctAnswers,
                answerTime: player.answerTime
            });
        });

        // Envoyer les résultats
        if (this.io) {
            this.io.to(this.roomName).emit('question-results', {
                correctAnswer: question.correct,
                correctOption: question.options[question.correct],
                explanation: question.explanation || '',
                results,
                leaderboard: this.getLeaderboard()
            });
        }

        logger.info(`Résultats de la question ${this.currentQuestion + 1} traités`);

        this.currentQuestion++;

        // Délai avant la prochaine question
        setTimeout(() => {
            this.startNextQuestion();
        }, GAME_CONFIG.BETWEEN_QUESTIONS_DELAY * 1000);
    }

    getLeaderboard() {
        return Array.from(this.players.values())
            .sort((a, b) => {
                // Tri par score, puis par temps de réponse moyen en cas d'égalité
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.averageAnswerTime - b.averageAnswerTime;
            })
            .map((player, index) => ({
                rank: index + 1,
                username: player.username,
                score: player.score,
                correctAnswers: player.correctAnswers,
                isCurrentUser: false // Sera mis à jour côté client
            }));
    }

    async endGame() {
        this.gameState = 'finished';
        const finalResults = this.getLeaderboard();

        try {
            // Sauvegarder les résultats finaux en base
            await this.savePlayersToDatabase();

            // Marquer la partie comme terminée
            if (this.gameId) {
                const game = await Game.findById(this.gameId);
                if (game) {
                    await game.complete();
                }
            }

        } catch (error) {
            logger.error('Erreur sauvegarde résultats finaux:', error);
        }

        // Envoyer les résultats finaux
        if (this.io) {
            this.io.to(this.roomName).emit('game-finished', {
                finalResults,
                gameStats: {
                    totalQuestions: this.questions.length,
                    category: this.category,
                    playersCount: this.players.size,
                    duration: Date.now() - this.gameStartTime
                }
            });
        }

        logger.info(`Partie terminée dans la salle ${this.roomName}`);
    }

    async savePlayersToDatabase() {
        if (!this.gameId) return;

        try {
            const playersList = Array.from(this.players.values())
                .sort((a, b) => b.score - a.score)
                .map((player, index) => ({ ...player, rank: index + 1 }));

            for (const player of playersList) {
                await Player.create({
                    gameId: this.gameId,
                    username: player.username,
                    socketId: player.socketId,
                    score: player.score,
                    finalRank: player.rank
                });
            }

            logger.info(`Résultats des joueurs sauvegardés pour la partie ${this.gameId}`);

        } catch (error) {
            logger.error('Erreur sauvegarde joueurs:', error);
        }
    }
}

module.exports = QuizRoom;