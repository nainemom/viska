import Vue from 'vue/dist/vue.esm';
import VueComponentStyle from 'vue-component-style';
import VueRouter from 'vue-router';
import SocketIo from 'socket.io-client';
import Root from './Root.vue';
import routes from './routes.js';


Vue.config.productionTip = false;
Vue.use(VueComponentStyle);
Vue.use(VueRouter);

const router = new VueRouter({
  routes,
});


new Vue({
  router,
  data() {
    return {
      server: undefined,
      isConnected: false, // server status: null=reconnecting, false=disconnected, true=connected
      sid: undefined,
      pid: undefined,
      chats: [],
    }
  },
  methods: {
    addUser(sid, pid = undefined) {
      if (!sid && !pid) {
        return;
      }
      const chat = this.chats.find((user) => user.sid === sid);
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
  },
  created() {
    this.server = SocketIo.connect(':3002');
    this.server.on('connect', () => {
      this.isConnected = true;
      this.sid = this.server.id;
      this.$emit('connectionStateChange', this.isConnected);
    });
    this.server.on('disconnect', () => {
      this.isConnected = false;
      this.sid = undefined;
      this.$emit('connectionStateChange', this.isConnected);
    });
    this.server.on('reconnecting', () => {
      this.isConnected = null;
      this.$emit('connectionStateChange', this.isConnected);
    });
  },
  render: (h) => h(Root),
}).$mount('#root');
