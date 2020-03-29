const PORT = parseInt(process.env.PORT || 3002);
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

const socketHandler = require('./socket-handler.js');

app.get('/ping', (req, res) => res.send('pong'));


io.on('connection', socketHandler(io));

server.listen(PORT, () => console.log(`App started on port ${PORT}!`));
