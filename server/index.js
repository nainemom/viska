/* eslint-disable no-console */
import http from 'http';
import express from 'express';
import socketIo from 'socket.io';
import db from 'mongoose';
import socketHandler from './socket-handler';
import httpHandler from './http-handler';

const PORT = parseInt(process.env.PORT || 3002, 10);
const expressApp = express();
const server = http.createServer(expressApp);
const io = socketIo({
  serveClient: false,
});
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
const users = new Map();
db.Promise = Promise;

const main = async () => {
  console.log('STARTING DATABASE...');
  // await db.connect('mongodb://localhost:27017/default');
  console.log('SETUPING HTTP...');
  httpHandler(expressApp, users);
  console.log('SETUPING IO...');
  socketHandler(io, users);
  // io.on('connection', socketHandler(io));
  console.log('RUNNING SERVER...');
  server.listen(PORT, () => console.log(`DONE! APP STARTED ON PORT ${PORT}!`));
};

main();
