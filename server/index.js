import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { httpRequestController, wsConnectionController, serverUpgradeController } from './controllers/index.js';
import { SERVER_PORT, SSL_KEY, SSL_CERT } from '../constants/index.server.js';

const main = async () => {
  const server = createServer({
    key: SSL_KEY,
    cert: SSL_CERT,
  });

  server.on('request', httpRequestController);
  server.on('upgrade', serverUpgradeController);
  const ws = new WebSocketServer({ server });
  ws.on('connection', wsConnectionController);
  server.listen(SERVER_PORT);
  console.log(`Done! Server Started on Port ${SERVER_PORT}!`);
};

main();
