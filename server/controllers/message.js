import typeOf from '../utils/typeOf.js';
import escapeHtml from 'escape-html';

export const sendMessage = ({ socket, users }) => async (data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    if (typeOf(data) !== 'object') {
      return callback(400);
    }
    const { identity, body } = data;

    if (typeOf(body) !== 'string' || !users.has(identity)) {
      return callback(400);
    }

    const messageObject = {
      from: socket.identity,
      to: identity,
      body: escapeHtml(body.trim()),
    };

    users.get(identity).emit('message', messageObject);
    return callback(200, messageObject);
  } catch (e) {
    console.error(e);
    return callback(500);
  }
};
