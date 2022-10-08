import {
  beforeConnect,
  connect,
  disconnect,
  pingUser,
} from './controllers/connection.js';
import {
  sendMessage,
} from './controllers/message.js';

export default (io, users) => {
  io.use(beforeConnect);

  io.on('connection', (socket) => {
    connect({ socket, users })();
    socket.on('disconnect', disconnect({ socket, users }));
    socket.on('pingUser', pingUser({ users }));
    socket.on('sendMessage', sendMessage({ socket, users }));
  });
};
