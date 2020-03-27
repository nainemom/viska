<template>
<div id="root">
  Server Stat: {{ this.$root.connecionState }} <br />
  SID: {{ this.$root.sid }} <br />
  PID: {{ this.$root.pid }} <br />
  <router-link to="/chats">Chats</router-link>
  <hr />
  <router-view></router-view>
</div>
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
}
</script>