const auth = require('./utils/auth.js');

const userFinderHandler = (type, xid) => (item) => item.type === type && item.xid === xid;

module.exports = (io, db, memDb) => (socket) => {
  let user = null;
  console.log('========> new connection', socket.id);

  // DONE
  socket.on('auth', ({ type, username, password }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user !== null) {
        return callback('dublicate', false);
      }
      if (type === 'persist') {
        if (!username || !password || !/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(username) || username.length < 3) {
          return callback('data-error', false);
        }
        
        const _username = username.toLowerCase();
        const _password = auth.generateKey(password, _username);
        const theUser = db.users.find((_user) => _user.username === _username && _user.type === type)[0];
        if (!theUser) {
          db.users.insert({
            username: _username,
            password: _password,
            type,
          });
          // no way that he is already actived
        } else {
          if (theUser.password !== _password) {
            return callback('wrong-password', false);
          }
          const isDublicate = memDb.activeUsers.find((_user) => _user.type === type && _user.username === username).length > 0;
          if (isDublicate) {
            return callback('dublicate', false);
          }

          user = theUser;
        }
        user = memDb.activeUsers.insert({
          username: _username,
          type,
          sid: socket.id,
          readyForChat: false,
        });

        const pendingMessages = db.pendingMessages.find((_item) => _item.to.type === type && _item.to.username === _username);

        setTimeout(() =>{
          pendingMessages.forEach((messageObject) => {
            io.sockets.connected[user.sid].emit('newMessage', {
              from: messageObject.from,
              body: messageObject.body,
              date: messageObject.date,
            });
            db.pendingMessages.remove(messageObject);
          });
        });

        return callback(false, {
          username: _username,
          type,
        });
      } else if (type === 'temporary') {
        const _username = `${Math.floor(Math.random() * 10000).toString()}${Date.now().toString()}`
          .split('1').join('a')
          .split('2').join('9')
          .split('3').join('o')
          .split('4').join('n')
          .split('5').join('y')
          .split('6').join('m')
          .split('7').join('0')
          .split('8').join('u')
          .split('9').join('s');
        const isDublicate = memDb.activeUsers.find((_user) => _user.type === type && _user.username === _username).length > 0;
        if (isDublicate) {
          return callback('dublicate', false);
        }
        user = memDb.activeUsers.insert({
          username: _username,
          type,
          sid: socket.id,
          readyForChat: false,
        });
        return callback(false, {
          username: _username,
          type,
        });
      }
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('cancelConnectToRandomUser', (callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user === null) {
        return callback(true, false);
      }

      if (user.readyForChat) {
        user.readyForChat = false;
        memDb.activeUsers.update(user);
      }
      return callback(false, true);

    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('connectToRandomUser', (callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user === null) {
        return callback(true, false);
      }

      const connectingUser = memDb.activeUsers.find((_user) => {
        return _user.readyForChat && _user.readyForChat.topic === 'general';
      })[0];

      if (connectingUser) {
        if (user.type === connectingUser.type && user.username === connectingUser.username) {
          return callback('duplicate', false);
        }
        io.sockets.connected[connectingUser.sid].emit('connetedToRandomUser', {
          type: user.type,
          username: user.username,
        });
        connectingUser.readyForChat = false;
        memDb.activeUsers.update(connectingUser);

        return callback(false, {
          type: connectingUser.type,
          username: connectingUser.username,
        });
      } else {
        user.readyForChat = {
          topic: 'general'
        }
        memDb.activeUsers.update(user);
        return callback('promise', false);
      }

    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });


  socket.on('getUserStatus', ( { type, username }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user === null) {
        return callback(true, false);
      }
      const theUser = memDb.activeUsers.find((_user) => {
        return _user.type === type && _user.username === username;
      })[0];

      if (!theUser) {
        return callback(false, false);
      }
      return callback(false, true);
    } catch(e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('sendMessage', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user === null) {
        return callback(true, false);
      }
      const { user: { type, username }, body } = data;
      const messageObject = {
        from: {
          username: user.username,
          type: user.type,
        },
        to: {
          username,
          type,
        },
        body,
        date: Date.now(),
      };
      const receiverUser = memDb.activeUsers.find((_user) => {
        return _user.type === type && _user.username === username;
      })[0];

      if (receiverUser) {
        io.sockets.connected[receiverUser.sid].emit('newMessage', messageObject);
      } else {
        const realReceiverUser = db.users.find((_user) => {
          return _user.type === type && _user.username === username;
        })[0];
        if (realReceiverUser) {
          db.pendingMessages.insert(messageObject);
        }
      }
      return callback(false, messageObject);

    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('sendIsTypingFlag', (data, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user === null) {
        return callback(true, false);
      }

      const { user: { type, username } } = data;

      const receiverUser = memDb.activeUsers.find((_user) => {
        return _user.type === type && _user.username === username;
      })[0];
      if (receiverUser) {
        io.sockets.connected[receiverUser.sid].emit('isTypingFlag', {
          type: user.type,
          username: user.username
        });
      }
      return callback(false, true);
    } catch(e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('disconnect', () => {
    if (user !== null) {
      memDb.activeUsers.remove(user);
    }

    console.log('========> lost connection', socket.id);
  });
  
}