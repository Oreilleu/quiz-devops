// src/models/Player.js
const { database } = require('../config/database');
const logger = require('../utils/logger');

class Player {
    constructor(data) {
        this.id = data.id;
        this.gameId = data.game_id;
        this.username = data.username;
        this.socketId = data.socket_id;
        this.score = data.score || 0;
        this.finalRank = data.final_rank;
        this.joinedAt = data.joined_at;
    }

    static async create(playerData) {
        try {
            const { gameId, username, socketId, score = 0, finalRank } = playerData;

            const result = await database.run(
                `INSERT INTO players (game_id, username, socket_id, score, final_rank) 
         VALUES (?, ?, ?, ?, ?)`,
                [gameId, username, socketId, score, finalRank]
            );

            const newPlayerData = await database.get(
                'SELECT * FROM players WHERE id = ?',
                [result.id]
            );

            return new Player(newPlayerData);

        } catch (error) {
            logger.error('Erreur création joueur:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const playerData = await database.get(
                'SELECT * FROM players WHERE id = ?',
                [id]
            );
            return playerData ? new Player(playerData) : null;
        } catch (error) {
            logger.error('Erreur recherche joueur:', error);
            return null;
        }
    }

    static async findByGameId(gameId) {
        try {
            const playersData = await database.all(
                'SELECT * FROM players WHERE game_id = ? ORDER BY final_rank ASC',
                [gameId]
            );
            return playersData.map(data => new Player(data));
        } catch (error) {
            logger.error('Erreur recherche joueurs par partie:', error);
            return [];
        }
    }

    static async getTopPlayers(limit = 10) {
        try {
            const playersData = await database.all(
                `SELECT username, MAX(score) as best_score, COUNT(*) as games_played 
         FROM players 
         GROUP BY username 
         ORDER BY best_score DESC 
         LIMIT ?`,
                [limit]
            );
            return playersData;
        } catch (error) {
            logger.error('Erreur top joueurs:', error);
            return [];
        }
    }

    async updateScore(newScore) {
        try {
            await database.run(
                'UPDATE players SET score = ? WHERE id = ?',
                [newScore, this.id]
            );
            this.score = newScore;
        } catch (error) {
            logger.error('Erreur mise à jour score:', error);
        }
    }

    async updateRank(rank) {
        try {
            await database.run(
                'UPDATE players SET final_rank = ? WHERE id = ?',
                [rank, this.id]
            );
            this.finalRank = rank;
        } catch (error) {
            logger.error('Erreur mise à jour rang:', error);
        }
    }
}

module.exports = Player;