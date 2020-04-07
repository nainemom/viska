module.exports = (io, auth, usersDb, readyToChatUsersDb, pendingMessagesDb) => (socket) => {
  const user = {
    socket,
    sid: socket.id,
    type: undefined,
    xid: undefined,
    readyToChat: false,
  };
  console.log('========> new connection', user.sid);

  socket.on('login', ({ type, data }, callback) => {
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (user.xid) {
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
      if (usersDb.get({ xid: xid, type: type })) {
        return callback(true, false);
      }
      user.xid = xid;
      user.type = type;
      usersDb.set({ xid: xid, type: type }, user);
      // give pending messages to user. TODO handle auto delete
      setTimeout(() => {
        const pendingMessages = pendingMessagesDb.get({ xid: xid, type: type });
        if (pendingMessages) {
          pendingMessages.forEach((pendingMessage) => {
            user.socket.emit('newMessage', pendingMessage);
            console.log('emiting...')
          });
          pendingMessagesDb.delete({ xid: xid, type: type });
        }
      }, 3000);
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
      if (!user.xid) {
        return callback(true, false);
      }
      const connectingUser = readyToChatUsersDb.get({ topic: 'general' });
      if (connectingUser) {
        if (connectingUser === user) {
          return callback('duplicate', false);
        }
        connectingUser.socket.emit('connetedToRandomUser',{
          type: user.type,
          xid: user.xid,
        });
        readyToChatUsersDb.delete({ topic: 'general' });
        return callback(false, {
          type: connectingUser.type,
          xid: connectingUser.xid
        });
      } else {
        readyToChatUsersDb.set({ topic: 'general' }, user);
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
      if (!user.xid) {
        return callback(true, false);
      }
      const theUser = usersDb.get({ xid: xid, type: type });
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
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (!user.xid) {
        return callback(true, false);
      }
      const { user: { type, xid }, body } = data;
      const messageObject = {
        user: {
          type: user.type,
          xid: user.xid,
        },
        body,
      };
      const receiverUser = usersDb.get({ xid: xid, type: type });
      if (receiverUser) {
        receiverUser.socket.emit('newMessage', messageObject);
        return callback(false, true);
      } else {
        pendingMessagesDb.put({ xid: xid, type: type }, messageObject);
        return callback(false, true);
        // receiver user is offline. so tell the user try again later
        return callback('receiver-is-offline', true);
      }

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
      if (!user.xid) {
        return callback(true, false);
      }
      const { user: { type, xid } } = data;
      const receiverUser = usersDb.get({ xid: xid, type: type });
      if (receiverUser) {
        receiverUser.socket.emit('isTypingFlag', { type: user.type, xid: user.xid });
      }
      return callback(false, true);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
    
  });

  socket.on('disconnect', () => {
    if (user.xid) {
      usersDb.delete({ xid: user.xid, type: user.type })
      // remove this user from users list
      // usersDb.delete({ sid: user.sid });
      readyToChatUsersDb.delete({ sid: user.sid });
    }
    console.log('========> lost connection', user.sid);
  });
  
}