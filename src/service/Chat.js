import SocketIo from 'socket.io-client';
import { translateToImg } from '../../utils/emoticons.js';
import initIndexedDB from '../../utils/indexedDB.js';

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
            this.db = initIndexedDB({
              name: 'viska',
              version: 2,
              prefix: this.user.type === 'temporary' ? '!anonymous' : `@${this.user.username}`,
              dynamicCollections: [
                'chats',
              ],
              staticCollections: [
                'settings',
              ],
            })
            this._loadChats().then(() => {
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
      this._saveChats().then(() => {
        // setTimeout(() => {
        this.chats = [];
        this.user = User();
        this.$emit('logout');
        setTimeout(() => {
          location.reload();
        }, 100);
        // }, 900);
      });
      // this._clearChats();

    },
    // find random user
    connectToRandomUser() {
      return new Promise((resolve, reject) => {
        this.server.emit('connectToRandomUser', (err, user) => {
          if (err || !user) {
            reject(err);
          } else {
            this.getChat(user.type, user.username).then((chat) => {
              resolve(chat);
            });
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
      this.getChat(type, username).then((chat) => {
        this.$emit('connetedToRandomUser', chat);
      });
    },
    addMessageToChat(chat, messageObject) {
      chat.messages.push(messageObject);
      const chatIndex = this.chats.indexOf(chat);
      this.chats = [
        chat,
        ...this.chats.slice(0, chatIndex),
        ...this.chats.slice(chatIndex + 1),
      ];
      return this._saveChats();
    },
    editChat(chat, changes) {
      Object.keys(changes).forEach((changeKey) => {
        chat[changeKey] = changes[changeKey];
      });
      return this._saveChats();
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
          this.addMessageToChat(chat, {
            from: 'me',
            body: translateToImg(messageObject.body),
            date: messageObject.date,
          }).then(resolve);
        });
      });
    },
    // receive new message from server
    _onNewMessage({from: { type, username }, body, date}) {
      this.getChat(type, username, false).then((chat) => {
        chat.isOnline = true;
        this.addMessageToChat(chat, {
          from: 'its',
          body: translateToImg(body),
          date,
        }).then(() => {
          this.$emit('newMessage', {
            user: User(type, username),
            body,
            date,
          });
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
    deleteChat(chat) {
      this.chats.splice(this.chats.indexOf(chat), 1);
      return this._saveChats();
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
    // save current chats in localStorage
    _saveChats() {
      return new Promise((resolve) => {
        if (this.db) {
          setTimeout(() => {
            const chats = this.chats.map((chat) => this.user.type === 'temporary' ? {
              ...chat,
              messages: [],
            } : chat);
            this.db.chats.set(chats).then(resolve);
          });
        } else {
          resolve();
        }
      });
    },
    // load current user chats from localStorage
    _loadChats() {
      return new Promise((resolve) => {
        if (this.db) {
          this.db.chats.get().then((chats) => {
            this.chats = (chats || []).map((chat) => {
              chat.isOnline = null;
              return chat;
            });
            resolve();
            this.startRefreshChatsLoop();
          });
        } else {
          this.chats = [];
          resolve();
        }
      });

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
    getChat(type, username, autoSave = true) {
      return new Promise((resolve) => {
        let chat = this.chats.find((chat) => chat.user.type === type && chat.user.username === username);
        if (!chat) {
          chat = {
            user: User(type, username),
            isOnline: null,
            messages: [],
            badge: 0,
          };
          this.chats.unshift(chat);
        }
        if (autoSave) {
          this._saveChats().then(() => {
            resolve(chat);
          });
        } else {
          resolve(chat);
        }
      });
    },
  },
}




export default ChatService;
