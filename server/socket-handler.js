const auth = require('./auth.js');
const users = [];

module.exports = (io) => (socket) => {
  const user = {
    socket,
    sid: socket.id,
    type: undefined,
    xid: undefined,
  };

  socket.on('login', ({ type, data }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user.type) {
        return callback(true, false);
      }
      let xid = undefined;
      if (type === 'did') {
        xid = auth.generateKey(JSON.stringify(data), '');
      } else if (type === 'pid') {
        if (!data.passprase || !data.salt) {
          return callback(true, false);
        }
        xid = auth.generateKey(data.passprase, data.salt);
      }
      const hasAnotherInstance = users.findIndex((_user) => _user.type === type && _user.xid === xid) > -1;
      if (hasAnotherInstance) {
        return callback(true, false);
      }
      user.xid = xid;
      user.type = type;
      users.push(user);
      return callback(false, user.xid);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('findRandomUser', (ignoreList, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      const availableUsers = users.filter((_user) => {
        return (
          ignoreList
            .findIndex((_ignore) => _ignore.xid !== _user.xid && _ignore.type !== _user.type) === -1 &&
          !(_user.xid === user.xid && _user.type === user.type)
        );
      });
      if (availableUsers.length === 0) {
        return callback(false, undefined);
      }
      const theUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      return callback(false, {
        type: theUser.type,
        xid: theUser.xid
      });
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });


  socket.on('getUserStatus', ( { type, xid }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      const theUser = users.find(_user => _user.type === type && _user.xid === xid);
      if (!theUser) {
        return callback(false, false);
      }
      return callback(false, theUser.sid && true);
    } catch(e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('sendMessage', (data, callback) => {
    if (typeof callback !== 'function' || !user.type) {
      return;
    }
    try {
      const { user: { type, xid }, body } = data;
      const receiverUser = users.find(_user => _user.type === type && _user.xid === xid);
      const messageObject = {
        user: {
          type: user.type,
          xid: user.xid,
        },
        body,
      };
      receiverUser.socket.emit('newMessage', messageObject);
      return callback(false, messageObject);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });



  socket.on('disconnect', () => {
    // remove this user from users list
    if (user.xid) {
      users.splice(users.findIndex(_user => _user.xid === user.xid && _user.type === user.type), 1);
    }
  });
  
}