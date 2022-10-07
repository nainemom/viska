import {
  sendMessage,
  emitMyPendingMessages,
} from './controllers/message';
import {
  connect,
  disconnect,
  getUser,
  randomUser,
} from './controllers/user';

export default (io, users) => {
  io.on('connection', (socket) => {
    connect(socket, users)();
    socket.on('disconnect', disconnect(socket, users));
    socket.on('getUser', getUser(users));
    socket.on('randomUser', randomUser(socket, users));
    socket.on('sendMessage', sendMessage(socket, users));
    socket.on('emitMyPendingMessages', emitMyPendingMessages(socket, users));
  });
};
