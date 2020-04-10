const auth = require('./utils/auth.js');

const userFinderHandler = (type, xid) => (item) => item.type === type && item.xid === xid;

module.exports = (io, db, memDb) => (socket) => {
  let user = null;
  console.log('========> new connection', socket.id);

  socket.on('login', ({ type, data }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user !== null) {
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
      } else {
        return callback(true, false);
      }

      const isDublicate = memDb.activeUsers.find(userFinderHandler(type, xid)).length > 0;
      if (isDublicate) {
        return callback(true, false);
      }

      user = memDb.activeUsers.insert({
        sid: socket.id,
        xid,
        type,
      });

      const pendingMessages = db.pendingMessages.find((_item) => _item.to.type === type && _item.to.xid === xid);

      setTimeout(() =>{
        pendingMessages.forEach((messageObject) => {
          io.sockets.connected[user.sid].emit('newMessage', {
            from: messageObject.from,
            to: messageObject.to,
            body: messageObject.body,
            date: messageObject.date,
          });
          db.pendingMessages.remove(messageObject);
        });
      }, 2000);
  
      return callback(false, user.xid);
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

      const connectingUser = memDb.readyForChatUsers.find((_user) => {
        return _user.chatTopic === 'general';
      })[0];

      if (connectingUser) {
        if (userFinderHandler(user.type, user.xid)(connectingUser.user)) {
          return callback('duplicate', false);
        }
        io.sockets.connected[connectingUser.user.sid].emit('connetedToRandomUser',{
          type: user.type,
          xid: user.xid,
        });
        memDb.readyForChatUsers.remove(connectingUser);
        return callback(false, {
          type: connectingUser.user.type,
          xid: connectingUser.user.xid
        });
      } else {
        console.info('add user to ready for chats');
        memDb.readyForChatUsers.insert({
          user: {
            type: user.type,
            xid: user.xid,
            sid: user.sid,
          },
          chatTopic: 'general',
        });
        return callback('promise', false);
      }

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
      if (user === null) {
        return callback(true, false);
      }

      const theUser = memDb.activeUsers.find(userFinderHandler(type, xid))[0];
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
      const { user: { type, xid }, body } = data;
      const messageObject = {
        from: {
          xid: user.xid,
          type: user.type,
        },
        to: {
          type: type,
          xid: xid,
        },
        body,
        date: Date.now(),
      };
      const receiverUser = memDb.activeUsers.find(userFinderHandler(type, xid))[0];

      if (receiverUser) {
        io.sockets.connected[receiverUser.sid].emit('newMessage', messageObject);
      } else {
        db.pendingMessages.insert(messageObject);
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

      const { user: { type, xid } } = data;

      const receiverUser = memDb.activeUsers.find(userFinderHandler(type, xid))[0];
      if (receiverUser) {
        io.sockets.connected[receiverUser.sid].emit('isTypingFlag', {
          type: user.type,
          xid: user.xid
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
      memDb.readyForChatUsers.remove(userFinderHandler(user.type, user.xid));
    }

    console.log('========> lost connection', socket.id);
  });
  
}