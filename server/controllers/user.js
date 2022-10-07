import { typeOf, findFromMap } from '../utils/handy';
import User from '../models/user';
import {
  userId as userIdCheck,
  userType as userTypeCheck,
  userSalt as userSaltCheck,
  userPassphrase as userPassphraseCheck,
} from '../validators';
import { generateKey } from '../utils/hash';
import { createUser } from '../utils/user';

export const connect = (socket, users) => () => {
  console.log('connect');
  try {
    const reject = () => console.log('reject connection') && socket.close();
    const { type = '!', username, password } = socket.handshake.auth || {};
    if (!userTypeCheck(type)) {
      reject();
    } else {
      let id = null;
      const hashedPassword = generateKey(password);

      if (type === '@') {
        if (!userSaltCheck(salt) || !userPassphraseCheck(passphrase)) {
          reject();
        }
        id = `@${generateKey(passphrase, salt)}`;
      } else {
        id = `!${generateKey(`${Date.now()}`, `${Math.random() * 1000}`)}`;
      }
      const user = createUser(id, socket);
      // eslint-disable-next-line no-param-reassign
      socket.userId = id;
      users.set(id, user);
      socket.emit('update', user.export());
    }
  } catch (e) {
    console.error(e);
  }
};

export const disconnect = (socket, users) => () => {
  console.log('disconnect');
  users.delete(socket.userId);
};

export const getUser = (users) => async (data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    if (typeOf(data) !== 'object') {
      return callback(400, '"data" should be object.');
    }
    const { id } = data;
    if (!userIdCheck(id)) {
      return callback(400, '"data.id" is not valid.');
    }
    if (!users.has(id)) {
      return callback(404, 'user not found');
    }
    return callback(200, users.get(id).export());
  } catch (e) {
    console.error(e);
    return callback(500, e);
  }
};

export const randomUser = (socket, users) => async (_data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    const user = users.get(socket.userId);

    user.lookingForRandomUser = !user.lookingForRandomUser;
    socket.emit('update', user.export());

    if (user.lookingForRandomUser) {
      const connectedUser = findFromMap(users, (item) => item.id !== user.id && item.lookingForRandomUser);
      if (connectedUser) {
        user.lookingForRandomUser = false;
        connectedUser.lookingForRandomUser = false;

        const userExport = user.export();
        const connectedUserExport = connectedUser.export();

        setTimeout(() => {
          connectedUser.socket.emit('update', connectedUserExport);
          socket.emit('update', userExport);
          connectedUser.socket.emit('randomUser', userExport);
          socket.emit('randomUser', connectedUserExport);
        }, 2000);
      } else {
        user.lookingForRandomUser = true;
      }
    }
    return callback(200);
  } catch (e) {
    console.error(e);
    return callback(500, e);
  }
};
