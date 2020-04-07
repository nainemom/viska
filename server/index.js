const PORT = parseInt(process.env.PORT || 3002);
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const store = require('./store.js');
const auth = require('./auth.js');

const usersDb = store.create('users');
const readyToChatUsersDb = store.create('readyToChatUsers');
const pendingMessagesDb = store.create('pendingMessages');

const socketHandler = require('./socket-handler.js');


app.get('/ping', (req, res) => res.send('pong'));
app.get('/state', (req, res) => {
  res.send({
    usersDb: usersDb.size,
    readyToChatUsersDb: readyToChatUsersDb.size,
    pendingMessagesDb: pendingMessagesDb.size,
  });
});


io.on('connection', socketHandler(io, auth, usersDb, readyToChatUsersDb, pendingMessagesDb));

server.listen(PORT, () => console.log(`App started on port ${PORT}!`));
