<template>
<div>
  chats...
  <ul>
    <li @click="auth">
      Auth
    </li>
    <li @click="pickRandomUserForChat">
      Find Random User for Chat
    </li>
    <li v-for="chat in chats" :key="chat.sid" @click="goToChat(chat.sid)">
      {{ chat.sid }}: ({{chat.messages.length ? chat.messages[chat.messages.length - 1].message : ''}})
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
    auth() {
      const passprase = prompt('enter passprase')
      const salt = prompt('enter salt (for example your email)');
      this.$root.server.emit('auth', {passprase, salt}, (err, pid) => {
        if (err) {
          alert('not available right now!')
        } else {
          this.$root.pid = pid;
          prompt('copy this', `127.0.0.1:8080/#/chats/pid/${pid}`);
        }
      });
    },
    pickRandomUserForChat() {
      this.$root.server.emit('pickRandomUser', (err, sid) => {
        if (err) {
          alert('not available right now!')
        } else {
          this.$root.upsertChat(sid);
          confirm('go to chat?') && this.goToChat(sid);
        }
      });
    },
    goToChat(sid) {
      this.$router.push(`/chats/sid/${sid}`)
    },
  },
}
</script>