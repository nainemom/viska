import { typeOf } from '../../utils/types.js';
import { SERVER_ACCESS_KEY } from '../../constants/index.server.js';
import { pbkdf2Sync } from 'crypto';

export const beforeConnect = (socket, next) => {
  console.log('connection request');
  const { accessKey = '', passphrase = '' } = socket.handshake.auth || {};
  if (
    typeOf(passphrase) !== 'string' || passphrase.length < 1,
    accessKey !== SERVER_ACCESS_KEY
  ) {
    console.log('connection rejected');
    return next(new Error("thou shall not pass"));
  }
  return next();
};

export const connect = ({ socket, users }) => () => {
  try {
    const { passphrase = '' } = socket.handshake.auth || {};
    const identity = pbkdf2Sync(passphrase, SERVER_ACCESS_KEY, 10000, 32, 'sha512').toString('hex');
    socket.identity = identity;
    users.set(identity, socket);
    socket.emit('identity', identity);
    console.log('connection approved.');

  } catch (e) {
    console.error(e);
  }
};

export const disconnect = (socket, users) => () => {
  users.delete(socket.identity);
  console.log('connection disconnected');
};

export const pingUser = ({ users }) => async (data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    if (typeOf(data) !== 'object') {
      return callback(false);
    }
    const { to } = data;
    if (users.has(to)) {
      return callback(true);
    }
    return callback(false);
  } catch (e) {
    console.error(e);
    return callback(false);
  }
};
