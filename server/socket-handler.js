const auth = require('./auth.js');

const users = [];

module.exports = (io) => (socket) => {
  const user = {
    socket,
    sid: socket.id, // socket_id
    pid: undefined, // public_id
  };
  users.push(user);
  io.emit(`sid:${user.sid}:connect`, user.sid);

  socket.on('auth', ({ passprase, salt }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    if (!passprase || !salt) {
      return callback(true, '');
    }
    user.pid = auth.generateKey(passprase, salt);
    io.emit(`pid:${user.pid}:connect`, user.sid);
    return callback(false, user.pid);
  });

  socket.on('pickRandomUser', (callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    if (users.length < 2) {
      return callback(true, undefined);
    }
    let theUser;
    do {
      theUser = users[Math.floor(Math.random() * users.length)];
    } while (theUser.sid === user.sid)
    return callback(false, theUser.sid);
  });

  socket.on('getUser', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    const { pid, sid } = data;
    if (pid) {
      const theUser = users.find(_user => _user.pid === pid);
      if (!theUser) {
        return callback(true, undefined);
      }
      return callback(false, theUser.sid);
    } else if (sid) {
      const theUser = users.find(_user => _user.sid === sid);
      if (!theUser) {
        return callback(true, undefined);
      }
      return callback(false, theUser.sid);
    } else {
      return callback(true, undefined);
    }

  });
  socket.on('validateSid', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    const { sid } = data;
    if (!sid) {
      return callback(true, undefined);
    }
    const theUser = users.find(_user => _user.sid === sid);
    if (!theUser) {
      return callback(true, undefined);
    }
    return callback(false, theUser.sid);
  });

  socket.on('getUserState', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    const { sid } = data;
    if (!sid) {
      return callback(true, false);
    }
    const theUser = users.find(_user => _user.sid === sid);
    if (!theUser) {
      return callback(false, false);
    }
    return callback(false, true);
  });

  socket.on('sendMessage', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    const { sid, message } = data; // idType is one of ['sid', 'pid']
    if (!sid || !message) {
      return callback(true, undefined);
    }
    const receiverUser = users.find(_user => _user.sid === sid);
    if (!receiverUser) {
      return callback(true, undefined);
    }
    const messageObject = {
      sid: user.sid,
      message
    };
    receiverUser.socket.emit('newMessage', messageObject);
    return callback(false, undefined);
  });



  socket.on('disconnect', () => {
    // remove this user from users list
    users.splice(users.findIndex(_user => _user.sid === user.sid), 1);
    io.emit(`${user.sid}:disconnect`);
  });
  
}