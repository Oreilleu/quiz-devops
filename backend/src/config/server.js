// src/config/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');
const apiRoutes = require('../routes/api');
const { initSocketHandlers } = require('../socket/socketManager');
const logger = require('../utils/logger');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: true, // Allow all origins for now
                methods: ["GET", "POST", "PUT", "DELETE"],
                allowedHeaders: ["Content-Type"],
                credentials: false
            }
        });
        this.port = process.env.PORT || 3001;
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: true, // Allow all origins for now
            methods: ["GET", "POST", "PUT", "DELETE"],
            allowedHeaders: ["Content-Type"],
            credentials: false
        }));
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use('/api', apiRoutes);

        // Route par défaut
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Quiz Multijoueur API',
                version: '1.0.0',
                status: 'running'
            });
        });
    }

    async initialize() {
        try {
            logger.info('Initialisation du serveur...');

            await initDatabase();
            this.setupMiddleware();
            initSocketHandlers(this.io);

            this.server.listen(this.port, () => {
                logger.info(`🚀 Serveur démarré sur le port ${this.port}`);
                logger.info(`📱 Interface disponible sur http://localhost:${this.port}`);
                logger.info(`🔗 API disponible sur http://localhost:${this.port}/api`);
            });

        } catch (error) {
            logger.error('Erreur initialisation serveur:', error);
            process.exit(1);
        }
    }
}

module.exports = Server;