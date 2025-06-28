// Configuration dynamique selon l'environnement
const getServerUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Configuration par environnement
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001'; // Développement
    } else if (hostname.includes('staging') || hostname.includes('dev')) {
        return 'https://your-staging-server.com'; // Staging
    } else {
        return 'https://your-production-server.com'; // Production
    }
};

const CONFIG = {
    SERVER_URL: getServerUrl(),
    SOCKET_TIMEOUT: 10000,
    MAX_USERNAME_LENGTH: 20,
    MAX_ROOM_NAME_LENGTH: 20,
    MIN_USERNAME_LENGTH: 2,
    MIN_ROOM_NAME_LENGTH: 2
};

const GAME_STATES = {
    WAITING: 'waiting',
    STARTING: 'starting',
    PLAYING: 'playing',
    RESULTS: 'results',
    FINISHED: 'finished'
};

const SCREEN_NAMES = {
    LOGIN: 'login',
    LOBBY: 'lobby',
    COUNTDOWN: 'countdown',
    GAME: 'game',
    RESULTS: 'results',
    FINAL: 'final'
};

const CATEGORIES = {
    'général': '🌍 Culture Générale',
    'science': '🧬 Science & Technologie',
    'histoire': '📚 Histoire',
    'géographie': '🗺️ Géographie',
    'sport': '⚽ Sport',
    'cinéma': '🎬 Cinéma & TV',
    'musique': '🎵 Musique',
    'littérature': '📖 Littérature'
};

const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};