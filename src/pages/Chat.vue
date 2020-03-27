<template>
<div>
  {{ state }}
  <ul>
    <li v-for="(message, index) in messages" :key="index">
      <div>
        {{ message.from }}:
        {{ message.message }}
      </div>
    </li>
  </ul>
  <form @submit.prevent="sendMessage">
    <input v-model="inputText" required :disabled="state === false"/>
  </form>
</div>
</template>

<script>

export default {
  data() {
    return {
      inputText: '',
      state: false,
      chat: undefined,
      sid: undefined,
      pid: undefined,

    }
  },
  computed: {
    type() {
      return this.$route.params.type;
    },
    id() {
      return this.$route.params.id;
    },
    messages() {
      return this.chat ? this.chat.messages : [];
    }
  },
  methods: {
    sendMessage() {
      this.$root.sendMessage(this.sid, this.pid, this.inputText).then(() => {
        this.inputText = '';
      });
    },
    onUserDisconnect() {
      this.state = false;
      this.unbindEvents();
    },
    onUserConnect(sid) {
      this.state = true;
      this.sid = sid;
      this.bindEvents();
    },

    bindEvents() {
      this.sid && this.$root.server.on(`${this.sid}:disconnect`, this.onUserDisconnect);
      this.pid && this.$root.server.off(`pid:${this.pid}:connect`, this.onUserConnect);
      this.sid && this.$root.server.off(`sid:${this.sid}:connect`, this.onUserConnect);
    },
    unbindEvents() {
      this.sid && this.$root.server.off(`${this.sid}:disconnect`, this.onUserDisconnect);
      this.pid && this.$root.server.on(`pid:${this.pid}:connect`, this.onUserConnect);
      this.sid && this.$root.server.on(`sid:${this.sid}:connect`, this.onUserConnect);
    },


    init() {
      this.state = false;
      this.sid = this.type === 'sid' ? this.id : undefined;
      this.pid = this.type === 'pid' ? this.id : undefined;
      this.chat = this.$root.upsertChat(this.sid, this.pid);
      this.$root.server.emit('getUser', {
        sid: this.sid,
        pid: this.pid,
      }, (error, newSid) => {
        if (error) {
          return this.onUserDisconnect();
        }
        this.onUserConnect(newSid);
      });
    }
  },
  created() {
    this.init();
  },
}
</script>