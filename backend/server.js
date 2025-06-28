const Server = require('./src/config/server');

const server = new Server();
server.initialize().catch(console.error);