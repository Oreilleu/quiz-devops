const { database } = require('../config/database');
const logger = require('../utils/logger');

class Game {
    constructor(data) {
        this.id = data.id;
        this.roomName = data.room_name;
        this.playersCount = data.players_count;
        this.totalQuestions = data.total_questions;
        this.category = data.category;
        this.status = data.status;
        this.createdAt = data.created_at;
        this.completedAt = data.completed_at;
    }

    static async create(roomName, category, playersCount, totalQuestions = 10) {
        try {
            const result = await database.run(
                `INSERT INTO games (room_name, category, players_count, total_questions, status) 
         VALUES (?, ?, ?, ?, 'waiting')`,
                [roomName, category, playersCount, totalQuestions]
            );

            const gameData = await database.get('SELECT * FROM games WHERE id = ?', [result.id]);
            return new Game(gameData);
        } catch (error) {
            logger.error('Erreur création game:', error);
            throw error;
        }
    }

    static async findByRoomName(roomName) {
        const gameData = await database.get('SELECT * FROM games WHERE room_name = ?', [roomName]);
        return gameData ? new Game(gameData) : null;
    }

    static async findById(id) {
        const gameData = await database.get('SELECT * FROM games WHERE id = ?', [id]);
        return gameData ? new Game(gameData) : null;
    }

    async updateStatus(status) {
        await database.run('UPDATE games SET status = ? WHERE id = ?', [status, this.id]);
        this.status = status;
    }

    async complete() {
        await database.run(
            'UPDATE games SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['completed', this.id]
        );
        this.status = 'completed';
        this.completedAt = new Date().toISOString();
    }

    async getPlayers() {
        const playersData = await database.all('SELECT * FROM players WHERE game_id = ?', [this.id]);
        return playersData.map(p => new (require('./Player'))(p));
    }

    async getQuestions() {
        const questionsData = await database.all(
            'SELECT * FROM questions WHERE game_id = ? ORDER BY question_number',
            [this.id]
        );
        return questionsData.map(q => new (require('./Question'))(q));
    }

    static async getRecentGames(limit = 10) {
        const gamesData = await database.all(
            `SELECT g.*, COUNT(p.id) as actual_players 
       FROM games g 
       LEFT JOIN players p ON g.id = p.game_id 
       GROUP BY g.id 
       ORDER BY g.created_at DESC 
       LIMIT ?`,
            [limit]
        );
        return gamesData.map(g => new Game(g));
    }

    static async getStats() {
        return await database.get(`
      SELECT 
        COUNT(*) as total_games,
        AVG(players_count) as avg_players,
        MAX(players_count) as max_players,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'playing' THEN 1 END) as active_games
      FROM games
    `);
    }
}

module.exports = Game;