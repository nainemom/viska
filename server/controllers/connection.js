import typeOf from '../utils/typeOf.js';
import { IDENTITY_TYPES, SERVER_ENTER_KEY } from '../constants/index.js';
import { pbkdf2Sync } from 'crypto';

export const connect = ({ socket, users }) => () => {
  console.log('connection request');
  try {
    const reject = () => {
      console.log('reject connection');
      socket.close();
    }
    const data = socket.handshake.auth || {};
    if (typeOf(data) !== 'object') {
      return reject();
    }
    const { enterKey = '', passphrase = '', identityType = 'temporary' } = socket.handshake.auth || {};
    if (
      typeOf(passphrase) !== 'string' || passphrase.length < 8,
      Object.hasOwnProperty.call(IDENTITY_TYPES, identityType),
      enterKey !== SERVER_ENTER_KEY
    ) {
      return reject();
    }

    const identity = `${IDENTITY_TYPES[identityType]}:${pbkdf2Sync(passphrase, SERVER_ENTER_KEY, 10000, 32, 'sha512').toString('hex')}`;
    socket.identity = identity;
    users.set(identity, socket);
    socket.emit('connect', identity);
    console.log('connection approved');
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
      return callback(400);
    }
    const { to } = data;
    if (users.has(to)) {
      return callback(200);
    }
    return callback(404);
  } catch (e) {
    console.error(e);
    return callback(500);
  }
};
