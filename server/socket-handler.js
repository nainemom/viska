import {
  sendMessage,
} from './controllers/message.js';
import {
  connect,
  disconnect,
  getUser,
} from './controllers/connection.js';

export default (io, users) => {
  io.on('connection', (socket) => {
    connect({ socket, users })();
    socket.on('disconnect', disconnect({ socket, users }));
    socket.on('getUser', getUser({ users }));
    socket.on('sendMessage', sendMessage({ socket, users }));
  });
};
