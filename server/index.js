import http from 'http';
import { default as Express } from 'express';
import { Server as SocketIo } from 'socket.io';
import cors from 'cors';
import socketHandler from './socket-handler.js';
import httpHandler from './http-handler.js';
import { SERVER_PORT, SERVER_ALLOWED_CLIENTS } from '../constants/index.server.js';

const corsConfig = {
  origin: SERVER_ALLOWED_CLIENTS,
};
const expressApp = new Express();
expressApp.use(cors(corsConfig))
const server = http.createServer(expressApp);
const io = new SocketIo({
  serveClient: false,
  cors: corsConfig,
});
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
const users = new Map();

const main = async () => {
  console.log('Registering Routes...');
  httpHandler(expressApp, users);
  console.log('Registering Socket Listener...');
  socketHandler(io, users);
  console.log('Starting Server...');
  server.listen(SERVER_PORT, () => console.log(`Done! Server Started on Port ${SERVER_PORT}!`));
};

main();
