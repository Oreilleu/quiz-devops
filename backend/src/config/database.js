// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const logger = require('../utils/logger');

class Database {
    constructor() {
        this.db = null;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(process.env.DB_PATH || 'quiz.db', (err) => {
                if (err) {
                    logger.error('Erreur connexion DB:', err);
                    reject(err);
                } else {
                    logger.info('✅ Base de données connectée');
                    resolve();
                }
            });
        });
    }

    async initTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_name TEXT UNIQUE,
        players_count INTEGER,
        total_questions INTEGER,
        category TEXT,
        status TEXT DEFAULT 'waiting',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )`,

            `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER,
        username TEXT,
        socket_id TEXT,
        score INTEGER DEFAULT 0,
        final_rank INTEGER,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES games(id)
      )`,

            `CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER,
        question_text TEXT,
        options TEXT,
        correct_answer INTEGER,
        question_number INTEGER,
        difficulty TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(game_id) REFERENCES games(id)
      )`,

            `CREATE TABLE IF NOT EXISTS player_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        question_id INTEGER,
        answer_index INTEGER,
        is_correct BOOLEAN,
        answer_time REAL,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(player_id) REFERENCES players(id),
        FOREIGN KEY(question_id) REFERENCES questions(id)
      )`
        ];

        for (const query of queries) {
            await this.run(query);
        }

        logger.info('✅ Tables de base de données initialisées');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

const database = new Database();

async function initDatabase() {
    await database.connect();
    await database.initTables();
}

module.exports = { database, initDatabase };