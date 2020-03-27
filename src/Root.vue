<template>
<router-view></router-view>
</template>

<script>
import VueRouter from 'vue-router';
import SocketIo from 'socket.io-client';
import Root from './Root.vue';
import routes from './routes.js';

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
        shadeColor: '#fff',
        backgroundColor: '#1e1e1e',
        fillColor: '#fff',
        backgroundColor2: '#252525',
        borderColor: 'rgba(0, 0, 0, 0.7)',
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        primaryColor: '#0c9029',
      }
    }
  },
  methods: {
    upsertChat(sid, pid = undefined) {
      if (!sid && !pid) {
        return;
      }
      const chat = pid ? this.chats.find((user) => user.pid === pid) : this.chats.find((user) => user.sid === sid);
      console.log(chat)
      if (chat) {
        return chat;
      } else {
        const chat = {
          sid,
          pid,
          messages: []
        };
        this.chats.push(chat);
        return chat;
      }
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
      console.log('on new message', sid)
      const chat = this.upsertChat(sid);
      chat.messages.push({
        from: 'its',
        message,
      });
    },
    sendMessage(sid, pid, message) {
      if (!sid) {
        return;
      }
      return new Promise((resolve, reject) => {
        const chat = this.upsertChat(sid, pid);
        chat.sid = sid;
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

    }
  },
  created() {
    this.server = SocketIo.connect(':3002');
    this.server.on('connect', this.onConnectionStateChange.bind(this, true));
    this.server.on('disconnect', this.onConnectionStateChange.bind(this, false));
    this.server.on('reconnecting', this.onConnectionStateChange.bind(this, null));
    this.server.on('newMessage', this.onNewMessage);
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
        background: this.theme.shadeColor,
        color: this.theme.fillColor,
      }),
    ];
  },
}
</script>