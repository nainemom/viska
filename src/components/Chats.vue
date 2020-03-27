<template>
<div :class="$style.container">


  <ul :class="$style.chatList">
    <li @click="auth">
      Auth
    </li>
    <li @click="pickRandomUserForChat">
      Find Random User for Chat
    </li>
    <li :class="$style.chatItem" v-for="chat in chats" :key="chat.sid" @click="goToChat(chat.sid)">
      <div class="name">{{ minifyText(chat.pid || chat.sid) }}</div>
      <div class="message">{{chat.messages.length ? chat.messages[chat.messages.length - 1].message : ''}}</div>
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
    minifyText(str) {
      if (str.length < 9) {
        return str;
      }
      return `${str.substr(0, 4)}${str.substr(str.length - 4)}`
    },
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
          confirm('go to chat?') && this.goToChat(sid);
        }
      });
    },
    goToChat(sid) {
      this.$router.push(`/chats/sid/${sid}`)
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        height: '100%',
      }),
      className('chatList', {
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }),
      className('chatItem', {
        display: 'flex',
        flexDirection: 'row',
        padding: '16px 8px',
        height: '48px',
        overflow: 'hidden',
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        '& > .name': {
          fontWeight: 'bold',
          fontSize: '16px',
        },
        '& > .message': {
          flexGrow: 1,
          opacity: 0.8,
          marginLeft: '8px',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'pre',
          textAlign: 'right',
        },
      }),
    ];
  }
}
</script>