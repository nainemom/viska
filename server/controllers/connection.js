import { typeOf, findFromMap } from '../utils/handy';
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
