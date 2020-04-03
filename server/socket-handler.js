module.exports = (io, auth, usersDb, readyToChatUsersDb) => (socket) => {
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
      // check if has another instance
      if (usersDb.find({ xid: xid, type: type })) {
        return callback(true, false);
      }
      user.xid = xid;
      user.type = type;
      usersDb.insert(user);
      return callback(false, user.xid);
    } catch (e) {
      console.error(e);
      return callback(true, false);
    }
  });

  socket.on('connectToRandomUser', (callback) => { // has bug
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (!user.xid) {
        return callback(true, false);
      }
      if (readyToChatUsersDb.find({ xid: user.xid, type: user.type })) {
        return callback('duplicate', false);
      }
      const connectingUser = readyToChatUsersDb.find({});
      if (connectingUser) {
        readyToChatUsersDb.delete({ xid: connectingUser.xid, type: connectingUser.type });
        readyToChatUsersDb.delete({ xid: user.xid, type: user.type });
        connectingUser.socket.emit('connetedToRandomUser',{
          type: user.type,
          xid: user.xid,
        });
        return callback(false, {
          type: connectingUser.type,
          xid: connectingUser.xid
        });
      } else {
        readyToChatUsersDb.insert(user);
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
      const theUser = usersDb.find({ xid: xid, type: type });
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
      const receiverUser = usersDb.find({ xid: xid, type: type });
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
    if (typeof callback !== 'function') {
      return;
    }
    try {
      if (!user.xid) {
        return callback(true, false);
      }
      const { user: { type, xid } } = data;
      const receiverUser = usersDb.find({ xid: xid, type: type });
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
      usersDb.delete({ sid: user.sid });
      readyToChatUsersDb.delete({ sid: user.sid });
    }
    console.log('========> lost connection', user.sid);
  });
  
}