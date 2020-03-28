<template>
<router-view></router-view>
</template>

<script>
import VueRouter from 'vue-router';
import SocketIo from 'socket.io-client';
import Root from './Root.vue';
import routes from './routes.js';
import { forEachSync } from '../utils/handy.js';

const router = new VueRouter({
  routes,
});

export default {
  router,
  data() {
    return {
      server: undefined,
      connecionState: false, // server status: null=reconnecting, false=disconnected, true=connected
      sid: undefined,
      pid: undefined,
      chats: [],
      theme: {
        // shadeColor: '#353535',
        fillColor: '#333',
        backgroundColor: '#fff',
        backgroundColor2: '#f1f1f1',
        backgroundColor3: '#f2f2f2',
        highlightColor: '#fdfdfd',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        primaryColor: 'linear-gradient(45deg, #3661ff, #3916c7)',
        primaryColorDeep: 'linear-gradient(45deg, #d1dbff, #cec3f8)',
        grayColor: '#c7c7c7',
        onlineColor: '#08c353',
      }
    }
  },
  methods: {
    findChat(sid, pid) {
      return pid ? this.chats.find((user) => user.pid === pid) : this.chats.find((user) => user.sid === sid);
    },
    removeChat(sid, pid) {
      const chatIndex = pid ? this.chats.findIndex((user) => user.pid === pid) : this.chats.findIndex((user) => user.sid === sid);
      if (chatIndex > -1) {
        if (this.$route.params.type === 'sid' && this.$route.params.id === this.chats[chatIndex].sid) {
          this.$router.push('/chats');
        }
        this.chats.splice(chatIndex, 1);
      }
    },
    updateChatState(sid, pid, newState) {
      const chat = this.findChat(sid, pid);
      if (chat) {
        chat.isOnline = newState;
        chat.lastUpdate = Date.now();
      }
    },
    activeChat(chat) {
      this.chats.forEach((_chat) => {
        _chat.isActive = false;
      });
      if (chat) {
        chat.isActive = true;
      }
    },
    upsertRandomChat() {
      return new Promise((resolve, reject) => {
        this.$root.server.emit('pickRandomUser', (err, sid) => {
          if (!err) {
            resolve(this.upsertChat(sid, undefined));
          }
        });
      });
    },
    refreshChat(chat) {
      return new Promise((resolve) => {
        this.$root.server.emit('getUser', {
          sid: chat.sid,
          pid: chat.pid,
        }, (error, newSid) => {
          chat.sid = newSid || chat.sid;
          chat.isOnline = !!newSid;
        });
      });
    },
    refreshChats() {
      return forEachSync(this.chats, (chat) => {
        return this.refreshChat(chat);
      });
    },
    upsertChat(sid, pid, calculateRest = false) {
      const searchBy = pid ? 'pid' : 'sid';
      const searchValue = pid || sid;
      let chat = this.chats.find((user) => user[searchBy] === searchValue);
      if (!chat) {
        chat = {
          sid,
          pid,
          isOnline: null,
          isActive: false,
          messages: [],
          lastUpdate: Date.now(),
        };
        this.chats.unshift(chat);
      }
      return chat;
    },
    onConnectionStateChange(state) {
      if (state === true) {
        this.sid = this.server.id;
      } else {
        this.sid = undefined;
      }
      this.connecionState = state;
    },
    onNewMessage({ sid, message }) {
      const chat = this.upsertChat(sid, undefined);
      chat.messages.push({
        from: 'its',
        message,
      });
      chat.lastUpdate = Date.now();
    },
    sendMessage(sid, pid, message) {
      if (!sid) {
        return;
      }
      return new Promise((resolve, reject) => {
        const chat = this.findChat(sid, pid);
        chat.sid = sid;
        chat.lastUpdate = Date.now();
        this.$root.server.emit('sendMessage', {
          sid,
          message,
        }, (error) => {
          if (error) {
            return reject();
          }
          chat.messages.push({
            from: 'me',
            message,
          });
          return resolve();
        })
      });

    },
  },
  created() {
    this.server = SocketIo.connect(':3002');
    this.server.on('connect', this.onConnectionStateChange.bind(this, true));
    this.server.on('disconnect', this.onConnectionStateChange.bind(this, false));
    this.server.on('reconnecting', this.onConnectionStateChange.bind(this, null));
    this.server.on('newMessage', this.onNewMessage);

    // const chatsBackup = null // localStorage.getItem('chats');
    // if (chatsBackup) {
    //   forEachSync(JSON.parse(chatsBackup).reverse(), (chat) => {
    //     return this.upsertChat(chat.sid, chat.pid, true);
    //   });
    // }
    // as this components will create once and there is no destroy event before browser close, so who care about clearInterval:)
    const reloadLoop = () => {
      this.refreshChats().then(() => {
        setTimeout(reloadLoop, 5000);
      });
    }
    reloadLoop();

    window.addEventListener('beforeunload', () => {
      // localStorage.setItem('chats', JSON.stringify(this.chats.filter((chat) => !!chat.pid)));
      // return true;
    });
  },
  
  style({ custom }) {
    return [
      custom('*', {
        padding: 0,
        margin: 0,
      '-webkit-overflow-scrolling': 'touch',
      'touchAction': 'pan-y',
      '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
      'box-sizing': 'border-box',
      }),
      custom('html, body, #root', {
        height: '100%',
        maxHeight: '100%',
        minHeight: '100%',
        fontFamily: 'monospace',
        background: this.theme.shadeColor,
        color: this.theme.fillColor,
      }),
    ];
  },
}
</script>