import { typeOf } from '../../utils/types.js';
import escapeHtml from 'escape-html';
import activeUsers from '../services/activeUsers.js';
import { createWsMessage } from '../../utils/wsMessage.js';

export const sendMessage = ({ socket, id }, data) => {
  try {
    if (typeOf(data) !== 'object') {
      return;
    }
    const { to, body } = data;

    if (typeOf(body) !== 'string' || !activeUsers.has(to)) {
      return;
    }

    const wsMessage = createWsMessage('message', {
      from: id,
      to,
      body: escapeHtml(body.trim()),
    });

    activeUsers.get(to).send(wsMessage);
    socket.send(wsMessage);
  } catch (_e) {}
};
