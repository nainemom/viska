import SocketIo from 'socket.io-client';
import initLoki from '../../utils/loki.js';

const User = (type, username) => {
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
      db: null,
      _refreshChatsLoopTimeout: null,
    }
  },
  methods: {
    init(serverUrl) {
      this.server = SocketIo(serverUrl, {
        autoConnect: false,
      });
      this.server.on('connect', this._onConnectionStateChange.bind(this, true));
      this.server.on('disconnect', this._onConnectionStateChange.bind(this, false));
      this.server.on('newMessage', this._onNewMessage);
      this.server.on('isTypingFlag', this._onIsTypingFlag);
      this.server.on('connetedToRandomUser', this._onConnetedToRandomUser);
      this.server.open();
      this.startRefreshChatsLoop();
    },
    // will connect to server...
    login(data) {
      return new Promise((resolve, reject) => {
        this.server.emit('auth', data, (err, res) => {
          if (err) {
            // this.server.close();
            reject(err);
          } else {
            this.user = User(res.type, res.username);
            initLoki({
              name: `${JSON.stringify(this.user)}.db`,
              memory: false,
              browser: true,
              collections: [
                'chats',
              ],
            }).then((db) => {
              this.db = db;
              this._loadChats();
              this.$emit('login', res.type, res.username);
              setTimeout(() => {
                this.server.emit('askForPendingMessages', () => {});
              });
              resolve();
            });
          }
        });
      });
    },
    // will disconnect from server
    logout() {
      this._clearChats();
      setTimeout(() => {
        this.user = User();
        this.$emit('logout');
        setTimeout(() => {
          location.reload();
        }, 100);
      }, 900);
    },
    // find random user
    connectToRandomUser() {
      return new Promise((resolve, reject) => {
        this.server.emit('connectToRandomUser', (err, user) => {
          if (err || !user) {
            reject(err);
          } else {
            const chat = this._upsertChat(user.type, user.username);
            this._saveChats();
            resolve(chat);
          }
        });
      });
    },
    cancelConnectToRandomUser() {
      return new Promise((resolve) => {
        this.server.emit('cancelConnectToRandomUser', (err) => {
          resolve();
        });
      });
    },
    // when new random user comes
    _onConnetedToRandomUser({ type, username }) {
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
    deleteChat(chat) {
      this.chats.splice(this.chats.indexOf(chat), 1);
      this.db.chats.remove((_chat) => _chat.user.type === chat.user.type && _chat.user.username === chat.user.username);
    },
    // refresh chat status
    refreshChat(chat) {
      return new Promise((resolve) => {
        this.server.emit('getUserStatus', chat.user, (err, status) => {
          chat.isOnline = err ? false : status;
          resolve(chat.isOnline);
        });
      });
    },
    startRefreshChatsLoop() {
      clearTimeout(this._refreshChatsLoopTimeout);
      this.chats.forEach((chat) => {
        this.refreshChat(chat);
      });
      this._refreshChatsLoopTimeout = setTimeout(() => {
        this.startRefreshChatsLoop();
      }, 10000);
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
      if (this.user.type === 'persist' && this.db) {
        // this.db.chats.remove(() => true);
        setTimeout(() => {
          this.chats.forEach((chat) => {
            try {
              this.db.chats.update(chat);
            } catch (e) {
              this.db.chats.insert(chat);
            }
          });
        });
        // localStorage.setItem(`${this.user.type}:${this.user.username}:chats`, JSON.stringify(chats));
      }
    },
    // load current user chats from localStorage
    _loadChats() {
      if (this.user.type === 'persist' && this.db) {
        this.chats = this.db.chats.find(() => true).map((chat) => {
          chat.isOnline = null;
          return JSON.parse(JSON.stringify(chat));
        });
        this.startRefreshChatsLoop();
      } else {
        this.chats = [];
      }
    },
    // delete current user chats
    _clearChats() {
      this.chats = [];
      // if (this.user.type === 'persist') {
      //   this.db.chats.remove(() => true);
      // }
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
          badge: 0,
        };
        this.chats.unshift(chat);
      }
      return chat;
    },
  },
}




export default ChatService;