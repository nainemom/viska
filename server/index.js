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

const startApp = async () => {
  console.log('STARTING THE APP...');
  const dbPath = path.resolve(__dirname, '../db/db.json');

  let cloud = null;
  if (process.env.VISKA_BACKBLAZE_APP_KEY && process.env.NODE_ENV === 'production') {
    console.log('RESTORING BACKUP FILES FROM BACKBLAZE...');
    cloud = await initCloud({
      applicationKey: process.env.VISKA_BACKBLAZE_APP_KEY,
      applicationKeyId: process.env.VISKA_BACKBLAZE_APP_KEY_ID,
      bucketId: process.env.VISKA_BACKBLAZE_BUCKET_ID,
    });
    await cloud.download(dbPath);
  }

  console.log('INTIALIZING DATABASE...');
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

  console.log('SETUP REQUEST HANDLERS...');
  const socketHandler = require('./socket-handler.js');
  app.get('/ping', (_req, res) => res.send('pong'));
  app.get('/state', (_req, res) => {
    res.send({
      db: {
        users: db.users.find(() => true).map((_user) => `@${_user.username}`), 
        pendingMessages: db.pendingMessages.find(() => true).map((_message) => `${_message.from.type === 'persist' ? '@' : '!'}${_message.from.username} => @${_message.to.username}`), 
      },
      memDb: {
        activeUsers: memDb.activeUsers.find(() => true).map((_user) => `${_user.type === 'persist' ? '@' : '!'}${_user.username}`), 
      }
    });
  });
  io.on('connection', socketHandler(io, db, memDb));
  
  server.listen(PORT, () => console.log(`DONE! APP STARTED ON PORT ${PORT}!`));
}



startApp();
