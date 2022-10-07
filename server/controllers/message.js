import { typeOf } from '../utils/handy';
import {
  userId as userIdCheck,
  messageBody as messageBodyCheck,
} from '../validators';
import {
  messageBody as messageBodyTransform,
} from '../transformers';
import Message from '../models/message';


export const sendMessage = (socket, users) => async (data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    if (typeOf(data) !== 'object') {
      return callback(400, '"data" should be object.');
    }
    const { body, to } = data;

    if (!messageBodyCheck(body)) {
      return callback(400, '"data.body" is not valid.');
    }

    if (!userIdCheck(to)) {
      return callback(400, '"data.to" is not valid.');
    }

    const from = socket.userId;
    const messageObject = {
      from,
      to,
      body: messageBodyTransform(body),
      sentAt: new Date(),
    };

    if (users.has(to)) {
      users.get(to).socket.emit('newMessage', messageObject);
      return callback(false, messageObject);
    }
    if (to.startsWith('@')) {
      // save message until user comeback
      const message = new Message(messageObject);
      await message.save();
      return callback(false, messageObject);
    }
    return callback(400, 'receiver user is not exists anymore!');
  } catch (e) {
    console.error(e);
    return callback(500, e);
  }
};

export const emitMyPendingMessages = (socket) => async (_data, callback) => {
  if (typeOf(callback) !== 'function') {
    return false;
  }
  try {
    const result = await Message.find({
      to: socket.userId,
    }).exec();
    result.forEach((message) => {
      socket.emit('newMessage', message);
    });
    if (result.length) {
      await Message.deleteMany({
        to: socket.userId,
      });
    }
    return callback(false, true);
  } catch (e) {
    console.error(e);
    return callback(500, e);
  }
};
