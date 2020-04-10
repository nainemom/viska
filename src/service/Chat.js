import { minifyStr, strToNumber, forEachSync } from '../../utils/handy.js';
import SocketIo from 'socket.io-client';
// import initDatabase from '../../utils/database.js';

// const db = initDatabase({
//   path: 'chats',
//   regenerate: false,
//   browser: true,
// });

// console.log(db)

const User = (type, username) => {
  // const name = !type ? '' : `${type.toUpperCase()}-${minifyStr(username, 10)}`;
  return {
    type,
    username,
  }
}

const ChatService = {
  data(){
    return {
      user: User(),
      sid: undefined,
      server: undefined,
      chats: [],
    }
  },
  methods: {
    init(serverUrl) {
      console.log('inited');
      this.server = SocketIo(serverUrl, {
        autoConnect: false,
      });
      this.server.on('connect', this._onConnectionStateChange.bind(this, true));
      this.server.on('disconnect', this._onConnectionStateChange.bind(this, false));
      this.server.on('newMessage', this._onNewMessage);
      this.server.on('isTypingFlag', this._onIsTypingFlag);
      this.server.on('connetedToRandomUser', this._onConnetedToRandomUser);
    },
    // will connect to server...
    login(data) {
      console.log('login', data);
      return new Promise((resolve, reject) => {
        this.server.open();
        this.$once('connect', () => {
          this.server.emit('auth', data, (err, res) => {
            if (err) {
              this.server.close();
              reject(err);
            } else {
              this.user = User(res.type, res.username);
              this._loadChats();
              this.$emit('login', res.type, res.username);
              resolve();
            }
          });
        });
      });
    },
    // will disconnect from server
    logout() {
      this._clearChats();
      this.user = User();
      this.server.close();
      this.$emit('logout');
    },
    // find random user
    connectToRandomUser() {
      return new Promise((resolve, reject) => {
        console.log('connecting to random user');
        this.server.emit('connectToRandomUser', (err, user) => {
          if (err || !user) {
            reject(err);
          } else {
            console.log('connected to random user', { type: user.type, username: user.username });
            const chat = this._upsertChat(user.type, user.username);
            this._saveChats();
            resolve(chat);
          }
        });
      });
    },
    // when new random user comes
    _onConnetedToRandomUser({ type, username }) {
      console.log('connected to random user', { type, username });
      const chat = this._upsertChat(type, username);
      this._saveChats();
      this.$emit('connetedToRandomUser', chat);
    },
    // send a message
    sendMessage(chat, body) {
      return new Promise((resolve, reject) => {
        this.server.emit('sendMessage', {
          user: chat.user,
          body,
        }, (err, messageObject) => {
          if (err) {
            reject(err);
          }
          chat.messages.push({
            from: 'me',
            body: messageObject.body,
            date: messageObject.date,
          });
          this._saveChats();
          resolve();
        });
      });
    },
    // send is_typing flag
    sendIsTypingFlag(chat) {
      return new Promise((resolve, reject) => {
        this.server.emit('sendIsTypingFlag', {
          user: {
            type: chat.user.type,
            username: chat.user.username,
          }
        }, (err) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        });
      });
    },
    // on is_typing flag
    _onIsTypingFlag(chat) {
      this.$emit('isTypingFlag', chat);
    },
    // get single chat
    getChat({ type, username }) {
      const chat = this._upsertChat(type, username);
      return chat;
    },
    // refresh chat status
    refreshChat(chat) {
      return new Promise((resolve, reject) => {
        this.server.emit('getUserStatus', chat.user, (err, status) => {
          if (err) {
            reject();
          } else {
            chat.isOnline = status;
            resolve(status);
          }
        });
      });
    },

    _onNewMessage({from: { type, username }, body, date}) {
      const chat = this._upsertChat(type, username);
      chat.isOnline = true;
      chat.messages.push({
        from: 'its',
        body,
        date,
      });
      this._saveChats();
      this.$emit('newMessage', {
        user: User(type, username),
        body,
        date,
      });
    },
    // save current chats in localStorage
    _saveChats() {
      if (this.user.type === 'persist') {
        const chats = this.chats.map((chat) => {
          return {
            ...chat,
            isOnline: null
          }
        });
        localStorage.setItem(`${this.user.type}:${this.user.username}:chats`, JSON.stringify(chats));
      }
    },
    // load current user chats from localStorage
    _loadChats() {
      return false;
      const cachedChats = localStorage.getItem(`${this.user.type}:${this.user.username}:chats`);
      if (cachedChats) {
        this.chats = JSON.parse(cachedChats).map((chat) => {
          // this is for backward compatibility
          if (!chat.pendingMessages) {
            chat.pendingMessages = [];
          }
          return chat;
        });
      }
    },
    // delete current user chats
    _clearChats() {
      localStorage.removeItem(`${this.user.type}:${this.user.username}:chats`);
      this.chats = [];
    },
    _onConnectionStateChange(newState) {
      if (newState === true) {
        this.sid = this.server.id;
        this.$emit('connect', this.sid);
      } else {
        location.reload();
        this.$emit('disconnect');
      }
    },
    _upsertChat(type, username) {
      let chat = this.chats.find((chat) => chat.user.type === type && chat.user.username === username);
      if (!chat) {
        chat = {
          user: User(type, username),
          isOnline: null,
          messages: [],
          pendingMessages: [],
        };
        this.chats.unshift(chat);
      }
      return chat;
    },
  },
}




export default ChatService;