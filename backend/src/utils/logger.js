// src/utils/logger.js
const fs = require('fs');
const path = require('path');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logger simple sans Winston pour éviter les dépendances
class Logger {
    constructor() {
        this.logFile = path.join(logsDir, 'app.log');
        this.errorFile = path.join(logsDir, 'error.log');
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${logData}\n`;
    }

    writeToFile(filename, content) {
        try {
            fs.appendFileSync(filename, content);
        } catch (error) {
            console.error('Erreur écriture log:', error);
        }
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('info', message, data);
        console.log(`ℹ️  ${message}`);
        this.writeToFile(this.logFile, logMessage);
    }

    error(message, data = null) {
        const logMessage = this.formatMessage('error', message, data);
        console.error(`❌ ${message}`);
        this.writeToFile(this.errorFile, logMessage);
        this.writeToFile(this.logFile, logMessage);
    }

    warn(message, data = null) {
        const logMessage = this.formatMessage('warn', message, data);
        console.warn(`⚠️  ${message}`);
        this.writeToFile(this.logFile, logMessage);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const logMessage = this.formatMessage('debug', message, data);
            console.log(`🐛 ${message}`);
            this.writeToFile(this.logFile, logMessage);
        }
    }
}

module.exports = new Logger();