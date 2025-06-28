// src/routes/api.js
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Route pour obtenir les statistiques globales
router.get('/stats', async (req, res) => {
    try {
        const stats = await Game.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

// Route pour obtenir les parties récentes
router.get('/recent-games', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await Game.getRecentGames(limit);
        res.json({
            success: true,
            data: games
        });
    } catch (error) {
        console.error('Erreur parties récentes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

// Route pour obtenir les détails d'une partie
router.get('/games/:id', async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Partie non trouvée'
            });
        }

        const players = await game.getPlayers();
        const questions = await game.getQuestions();

        res.json({
            success: true,
            data: {
                game,
                players,
                questions
            }
        });
    } catch (error) {
        console.error('Erreur détails partie:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
});

// Route de santé
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Serveur en ligne',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;