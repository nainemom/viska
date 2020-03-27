<template>
<div :class="$style.container">
  <ul :class="$style.conversation">
    {{ state }}
    <li v-for="(message, index) in messages" :key="index">
      <div>
        {{ message.from }}:
        {{ message.message }}
      </div>
    </li>
  </ul>
  <MessageForm :class="$style.messageForm" @submit="sendMessage" v-model="inputText" :disabled="state === false" />
</div>
</template>

<script>
import MessageForm from './MessageForm.vue';

export default {
  components: {
    MessageForm,
  },
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
    finish() {
      this.sid && this.$root.server.off(`${this.sid}:disconnect`, this.onUserDisconnect);
      this.pid && this.$root.server.off(`pid:${this.pid}:connect`, this.onUserConnect);
      this.sid && this.$root.server.off(`sid:${this.sid}:connect`, this.onUserConnect);
    },

    start(type, id) {
      this.state = false;
      this.sid = type === 'sid' ? id : undefined;
      this.pid = type === 'pid' ? id : undefined;
      this.chat = this.$root.upsertChat(this.sid, this.pid);
      console.log('starting')
      this.$root.server.emit('getUser', {
        sid: this.sid,
        pid: this.pid,
      }, (error, newSid) => {
        console.log(newSid);
        if (error) {
          return this.onUserDisconnect();
        }
        this.onUserConnect(newSid);
      });
    }
  },
  beforeDestroy() {
    this.finish();
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }),
      className('conversation', {
        flexGrow: 1,
        overflowY: 'scroll',
      }),
      className('messageForm', {
        padding: '15px',
        backgroundColor: this.$root.theme.backgroundColor2,
        borderTop: `solid 1px ${this.$root.theme.borderColor}`,
      }),
    ];
  }
}
</script>