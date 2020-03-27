<template>
<div>
  chats...
  <ul>
    <li @click="pickRandomUserForChat">
      Find Random User for Chat
    </li>
    <li v-for="chat in chats" :key="chat.sid" @click="goToChat(chat.sid)">
      <div> SID: {{ chat.sid }} </div>
      <div> MESSAGES: {{chat.messages}} </div>
    </li>
  </ul>
</div>
</template>

<script>

export default {
  computed: {
    chats() {
      return this.$root.chats;
    },
  },
  methods: {
    pickRandomUserForChat() {
      this.$root.server.emit('pickRandomUser', (err, sid) => {
        console.log(typeof sid, sid)
        if (err) {
          alert('not available right now!')
        } else {
          this.$root.addUser(sid);
          confirm('go to chat?') && this.goToChat(sid);
        }
      });
    },
    goToChat(sid) {
      this.$router.push(`/chats/sid/${sid}`)
    },
    onNewMessage(data) {
      const { sid, message } = data;
      console.log('new message', sid, message, this.chats);
      const chat = this.$root.addUser(sid);
      chat.messages.push({
        from: 'its',
        message: message.toString(),
      });
    },
  },
  created() {
    this.$root.server.on('newMessage', this.onNewMessage);
  }
}
</script>