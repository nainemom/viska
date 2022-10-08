import { typeOf } from '../../utils/types.js';
import escapeHtml from 'escape-html';

export const sendMessage = ({ socket, users }) => async (data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    if (typeOf(data) !== 'object') {
      return callback(false);
    }
    const { identity, body } = data;

    if (typeOf(body) !== 'string' || !users.has(identity)) {
      return callback(false);
    }

    const messageObject = {
      from: socket.identity,
      to: identity,
      body: escapeHtml(body.trim()),
    };

    users.get(identity).emit('message', messageObject);
    return callback(true, messageObject);
  } catch (e) {
    console.error(e);
    return callback(false);
  }
};
