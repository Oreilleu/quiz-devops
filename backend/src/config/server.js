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
                origin: process.env.ALLOWED_ORIGINS?.split(',') || function(origin, callback) {
                    // Allow requests with no origin (like mobile apps or curl requests)
                    if (!origin) return callback(null, true);
                    
                    // Allow localhost and 127.0.0.1 on any port for development
                    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
                        return callback(null, true);
                    }
                    
                    // Block other origins in development
                    callback(new Error('Not allowed by CORS'));
                },
                methods: ["GET", "POST", "PUT", "DELETE"],
                allowedHeaders: ["Content-Type"],
                credentials: false
            }
        });
        this.port = process.env.PORT || 3001;
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || function(origin, callback) {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) return callback(null, true);
                
                // Allow localhost and 127.0.0.1 on any port for development
                if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
                    return callback(null, true);
                }
                
                // Block other origins in development
                callback(new Error('Not allowed by CORS'));
            },
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