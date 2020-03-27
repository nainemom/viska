const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const socketHandler = require('./socket-handler.js');

app.get('/ping', (req, res) => res.send('pong'));


io.on('connection', socketHandler(io));

server.listen(3002, () => console.log(`App started on port ${3002}!`));
