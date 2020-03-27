const auth = require('./auth.js');

const users = [];

module.exports = (io) => (socket) => {
  const user = {
    socket,
    sid: socket.id, // socket_id
    pid: undefined, // public_id
  };
  users.push(user);
  console.log('connected', user.sid)

  socket.on('auth', (passprase, callback) => {
    user.pid = auth.generateKey(passprase, salt);
    callback(false, user.pid);
  });

  socket.on('pickRandomUser', (callback) => {
    if (users.length < 2) {
      return callback(true, undefined);
    }
    let theUser;
    do {
      theUser = users[Math.floor(Math.random() * users.length)];
    } while (theUser.sid === user.sid)
    return callback(false, theUser.sid);
  });

  socket.on('getUserState', (data, callback) => {
    const { sid } = data; // idType is one of ['sid', 'pid']
    if (!sid) {
      return callback(true, false);
    }
    const theUser = users.find(_user => _user.sid === sid);
    if (!theUser) {
      return callback(true, false);
    }
    return callback(false, true)
  });

  socket.on('sendMessage', (data, callback) => {
    const { sid, message } = data; // idType is one of ['sid', 'pid']
    if (!sid || !message) {
      return callback(true, undefined);
    }
    const receiverUser = users.find(_user => _user.sid === sid);
    if (!receiverUser) {
      return callback(true, undefined);
    }
    receiverUser.socket.emit('newMessage', {
      sid: user.sid,
      message
    });
    return callback(false, undefined);
  });



  socket.on('disconnect', () => {
    // remove this user from users list
    users.splice(users.findIndex(_user => _user.sid === user.sid), 1);
  });
  
}