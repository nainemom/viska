const auth = require('./auth.js');
const users = [];
const readyToChatUsers = [];

module.exports = (io) => (socket) => {
  const user = {
    socket,
    sid: socket.id,
    type: undefined,
    xid: undefined,
    readyToChat: false,
  };
  setInterval(() => {
    console.log('===========================');
    console.log('=== Users:');
    users.forEach(_user => console.log(user.sid));
    console.log('=== Ready For Chat Users:');
    readyToChatUsers.forEach(_user => console.log(user.sid));
    console.log('===========================');
    console.log('');
  }, 10000);
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

  socket.on('connetToRandomUser', (callback) => {
    if (typeof callback !== 'function' || !user.xid) {
      return;
    }
    try {
      if (readyToChatUsers.includes(user)) {
        return callback('duplicate', false);
      }
      for (let i = 0; i < readyToChatUsers.length; i++) {
        const _user = users[i];
        if (_user !== user) {
          _user.socket.emit('connetedToRandomUser',{
            type: user.type,
            xid: user.xid,
          });
          // remove _user from readyToChatUsers
          readyToChatUsers.splice(i, 1);
          return callback(false, {
            type: _user.type,
            xid: _user.xid
          });
        }
      };
      // move current user to readyToChatUsers
      readyToChatUsers.push(user);
      return callback('promise', false);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });


  socket.on('getUserStatus', ( { type, xid }, callback) => {
    if (typeof callback !== 'function' || !user.xid) {
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
    if (typeof callback !== 'function' || !user.xid) {
      return;
    }
    try {
      const { user: { type, xid }, body } = data;
      const receiverUser = users.find(_user => _user.type === type && _user.xid === xid);
      if (receiverUser) {
        const messageObject = {
          user: {
            type: user.type,
            xid: user.xid,
          },
          body,
        };
        receiverUser.socket.emit('newMessage', messageObject);
        return callback(false, true);
      } else {
        // receiver user is offline. so tell the user try again later
        return callback('receiver-is-offline', true);
      }

    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('sendIsTypingFlag', (data, callback) => {
    if (typeof callback !== 'function' || !user.xid) {
      return;
    }
    try {
      const { user: { type, xid } } = data;
      const receiverUser = users.find(_user => _user.type === type && _user.xid === xid);
      receiverUser.socket.emit('isTypingFlag', { type: user.type, xid: user.xid });
      return callback(false, true);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
    
  });

  socket.on('disconnect', () => {
    if (user.xid) {
      // remove this user from users list
      const usersIndex = users.indexOf(user);
      const readyToChatUsersIndex = readyToChatUsers.indexOf(user);
      usersIndex !== -1 && users.splice(usersIndex, 1);
      readyToChatUsersIndex !== -1 && readyToChatUsers.splice(readyToChatUsersIndex, 1);
    }
  });
  
}