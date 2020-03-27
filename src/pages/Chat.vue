<template>
<div>
  <ul>
    <li v-for="(message, index) in messages" :key="index">
      <div>
        {{ message.from }}:
        {{ message.message }}
      </div>
    </li>
  </ul>
  <form @submit.prevent="sendMessage">
    <input v-model="inputText" required/>
  </form>
</div>
</template>

<script>

export default {
  data() {
    return {
      inputText: '',
    }
  },
  computed: {
    type() {
      return this.$route.params.type;
    },
    id() {
      return this.$route.params.id;
    },
    chat() {
      return this.$root.chats.find((user) => user[this.type] === this.id);
    },
    messages() {
      return this.chat ? this.chat.messages : [];
    }
  },
  methods: {
    sendMessage() {
      if (!this.chat) {
        return;
      }
      const message = this.inputText;
      this.$root.server.emit('sendMessage', {
        sid: this.chat.sid,
        message,
      }, (error) => {
        if (!error) {
          this.messages.push({
            from: 'me',
            message,
          });
          this.inputText = '';
        }
      })
    },
    onNewMessage(sid, message) {
      if (!this.chat) {
        return;
      }
      if (sid === this.chat.id) {
        this.messages.push({
          from: 'its',
          message,
        });
      }
    }
  },
  created() {
    this.$root.server.on('newMessage', this.onNewMessage);
  }
}
</script>