const PORT = parseInt(process.env.PORT || 3002);
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const startLoki = require(path.resolve(__dirname, './loki.js'));
// const initCloud = require(path.resolve(__dirname, './utils/cloud.js'));
const startDatabase = require(path.resolve(__dirname, './database.js'));

const startApp = async () => {
  console.log('STARTING THE APP...');

  console.log('INITIALIZING MONGO DATABASE..');
  const db = await startDatabase();

  console.log('INTIALIZING LOKI...');
  const memDb = await startLoki();

  console.log('SETUP REQUEST HANDLERS...');
  const socketHandler = require('./socket-handler.js');
  app.get('/ping', (_req, res) => res.send('pong'));
  app.get('/active-users', (_req, res) => {
    res.send(memDb.activeUsers.find(() => true).map((_user) => `${_user.type === 'persist' ? '@' : '!'}${_user.username}`));
  });
  io.on('connection', socketHandler(io, db, memDb));
  
  server.listen(PORT, () => console.log(`DONE! APP STARTED ON PORT ${PORT}!`));
}



startApp();
