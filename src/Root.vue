<template>
<div :class="$style.container">
  <router-view></router-view>
  <AuthPopup ref="authPopup"/>
</div>
</template>

<script>
import Vue from 'vue';
import VueRouter from 'vue-router';
import SocketIo from 'socket.io-client';
import Root from './Root.vue';
import routes from './routes.js';
import AuthPopup from './components/AuthPopup.vue';
import { forEachSync } from '../utils/handy.js';

const router = new VueRouter({
  routes,
});

export default {
  router,
  components: {
    AuthPopup,
  },
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
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        primaryColor: 'linear-gradient(45deg, #3661ff, #3916c7)',
        primaryColorDeep: 'linear-gradient(45deg, #d1dbff, #cec3f8)',
        grayColor: '#c7c7c7',
        onlineColor: '#08c353',
        avatarBackgroundColor: '#b893ff',
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
        this.$root.server.emit('findRandomSid', this.$root.chats.map((chat) => chat.sid), (err, sid) => {
          if (!err && sid) {
            resolve(this.upsertChat(sid, undefined));
          } else {
            reject();
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
    upsertChat(sid, pid, messages = []) {
      const searchBy = pid ? 'pid' : 'sid';
      const searchValue = pid || sid;
      let chat = this.chats.find((user) => user[searchBy] === searchValue);
      if (!chat) {
        chat = {
          sid,
          pid,
          isOnline: null,
          isActive: false,
          messages,
          lastUpdate: Date.now(),
        };
        this.chats.unshift(chat);
      }
      return chat;
    },
    onConnectionStateChange(state) {
      if (state === true) {
        this.sid = this.server.id;
        this.$refs.authPopup.open();
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
    forgotAnything() {
      localStorage.removeItem('salt');
      localStorage.removeItem('passprase');
      localStorage.removeItem(`${this.pid}:chats`);
      location.reload();
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
    getStaticLink(link) {
      return `${process.env.STATIC_URL_PREFIX || ''}${link}`
    },
    notify(title, text, icon) {
      const show = () => {
        const notification = new Notification('', {
          renotify: true,
          body: `${title}\n ${text}`,
          icon: icon,
          tag: 'msg'
        });
        notification.onclick = () => {
          // move route
        }
      }
      if (!('Notification' in window)) {
        return
      } else if (Notification.permission === 'granted') {
        show();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          // Whatever the user answers, we make sure we store the information
          if(!('permission' in Notification)) {
            Notification.permission = permission;
          }
          if (permission === "granted") {
            show();
          }
        });
      }

    }
  },
  created() {
    this.server = SocketIo.connect(process.env.SERVER_URL);
    this.server.on('connect', this.onConnectionStateChange.bind(this, true));
    this.server.on('disconnect', this.onConnectionStateChange.bind(this, false));
    this.server.on('reconnecting', this.onConnectionStateChange.bind(this, null));
    this.server.on('newMessage', this.onNewMessage);

    // as this components will create once and there is no destroy event before browser close, so who care about clearInterval:)
    const reloadLoop = () => {
      this.refreshChats().then(() => {
        setTimeout(reloadLoop, 5000);
      });
    }
    reloadLoop();

    window.onbeforeunload = () => {
      if (this.pid) {
        localStorage.setItem(`${this.pid}:chats`, JSON.stringify(this.chats));
      }
      if (process.env.NODE_ENV === 'production') {
        return true;
      } else {
        // do not open are sure window before close
        return null;
      }
    };
  },
  
  style({ custom, className }) {

    const helperClasses = [];
    const baseSize = 8;
    const sizeValues = [0.5, 1, 2, 3];
    ['margin', 'padding'].forEach((propName) => {
      ['sm', 'md', 'lg', 'xl'].forEach((sizeText, sizeIndex) => {
        const value = `${sizeValues[sizeIndex] * baseSize}px`;
        ['', '-left', '-right', '-top', '-bottom', '-x', '-y'].forEach((direction) => {
          const name = `.${propName}${direction}-${sizeText}`;
          if (direction === '-x') {
            helperClasses.push(custom(name, {
              [`${propName}-left`]: value,
              [`${propName}-right`]: value,
            }));
          } else if (direction === '-y') {
            helperClasses.push(custom(name, {
              [`${propName}-top`]: value,
              [`${propName}-bottom`]: value,
            }));
          } else {
            helperClasses.push(custom(name, {
              [`${propName}${direction}`]: value,
            }));
          }
        });
      });
    });

    const heightValues = [4, 5, 6, 7, 8, 9];
    const fontSizeValues = [0.8, 0.9, 1, 1.05, 1.1, 1.15];
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((sizeText, sizeIndex) => {
      helperClasses.push(custom(`.size-${sizeText}`, {
        minHeight: `${heightValues[sizeIndex] * baseSize}px`,
        fontSize: `${fontSizeValues[sizeIndex]}rem`,
      }));
    });

    const containerStyle = {
      height: '100%',
      maxHeight: '100%',
      minHeight: '100%',
      background: this.theme.shadeColor,
      color: this.theme.fillColor,
      fontSize: '15px',
    };
    return [
      custom('*', {
        padding: 0,
        margin: 0,
        touchAction: 'pan-y',
        boxSizing: 'border-box',
        userSelect: 'none',
        '-webkit-overflow-scrolling': 'touch',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        fontFamily: '"Ubuntu Mono", monospace',
      }),
      custom('html, body, #root', containerStyle),
      className('container', containerStyle),
      ...helperClasses,
    ];
  },
}
</script>