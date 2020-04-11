const PORT = parseInt(process.env.PORT || 3002);
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const initDatabase = require(path.resolve(__dirname, '../utils/database.js'));
const initCloud = require(path.resolve(__dirname, './utils/cloud.js'));
// const initStore = require('./utils/store.js');

// const usersDb = store.create('users');
// const readyToChatUsersDb = store.create('readyToChatUsers');
// const pendingMessagesDb = store.create('pendingMessages');


const startApp = async () => {
  let cloud = null;

  if (process.env.VISKA_BACKBLAZE_APP_KEY) {
    cloud = await initCloud({
      applicationKey: process.env.VISKA_BACKBLAZE_APP_KEY,
      applicationKeyId: process.env.VISKA_BACKBLAZE_APP_KEY_ID,
      bucketId: process.env.VISKA_BACKBLAZE_BUCKET_ID,
    });
  }

  const dbPath = path.resolve(__dirname, '../db/db.json');

  cloud && await cloud.download(dbPath);

  const db = await initDatabase({
    name: dbPath,
    memory: false,
    syncToCloud: cloud ? () => {
      return cloud.upload(dbPath);
    } : false,
    collections: [
      'users',
      'pendingMessages',
    ],
  });
  const memDb = await initDatabase({
    name: 'memDb',
    memory: true,
    collections: [
      'activeUsers',
    ],
  });


  const socketHandler = require('./socket-handler.js');


  app.get('/ping', (_req, res) => res.send('pong'));
  app.get('/state', (_req, res) => {
    res.send({
      db: {
        users: db.users.find(() => true), 
        pendingMessages: db.pendingMessages.find(() => true), 
      },
      memDb: {
        activeUsers: memDb.activeUsers.find(() => true), 
      }
    });
  });
  
  
  io.on('connection', socketHandler(io, db, memDb));
  
  server.listen(PORT, () => console.log(`App started on port ${PORT}!`));
}



startApp();
