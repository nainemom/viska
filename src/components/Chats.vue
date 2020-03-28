<template>
<div :class="$style.container">
  <div :class="$style.chatList">
    <Cell>
      <div class="item">
        <i class="icon fa fa-key" />
      </div>
      <div class="item grow">Click to Auth</div>
    </Cell>

    <Cell>
      <div class="item">
        <UserTitle :showName="false" playMode/>
      </div>
      <div class="item grow">Chat with Random User</div>
    </Cell>

    <ChatListItem @click.native="auth" :class="$style.topButtons" v-if="!$root.pid">
      <i class="icon fa fa-key" />
      <div class="name">Click to Auth</div>
    </ChatListItem>
    <ChatListItem @click.native="auth" :class="$style.topButtons" v-if="$root.pid">
      <i class="icon fa fa-key" />
      <div class="name">PID: {{$root.pid}}</div>
      <div>
        <button :class="$style.copyButton"> <i class="icon fa fa-copy" /> Copy Link </button>
      </div>
    </ChatListItem>
    <ChatListItem @click.native="pickRandomUserForChat" :class="$style.topButtons">
      <div class="name">
        <UserTitle :showName="false"/>
      </div>
      <div class="name">
        Find Random User
      </div>
    </ChatListItem>
    <ChatListItem v-for="chat in chats" :key="chat.pid || chat.sid" :chat="chat" @click.native="goToChat(chat)" :class="$style.chatItem" />
  </div>
</div>
</template>

<script>
import ChatListItem from './ChatListItem.vue';
import UserTitle from './UserTitle.vue';
import Cell from './Cell.vue';

export default {
  components: {
    ChatListItem,
    UserTitle,
    Cell,
  },
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
      this.$root.upsertRandomChat().then((chat) => {
        this.goToChat(chat);
      })
    },
    goToChat(chat) {
      this.$root.activeChat(chat);
      const path = `/chats/${chat.pid ? 'pid' : 'sid'}/${chat.pid || chat.sid}`;
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        height: '100%',
      }),
      className('chatList', {
        margin: 0,
        padding: 0,
      }),
      className('chatItem', {
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        cursor: 'pointer',
        '&.actived': {
          // borderLeft: `solid 6px ${this.$root.theme.primaryColor}`,
          // textDecoration: 'underline',
          background: this.$root.theme.primaryColor,
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'default',
        },
      }),
      className('topButtons', {
        display: 'block',
        padding: '16px 8px',
        height: '56px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
      }),
      className('copyButton', {
        display: 'inline-block',
        padding: '0 16px',
        height: '32px',
        borderRadius: '32px',
        background: this.$root.theme.backgroundColor,
        cursor: 'pointer',
        overflow: 'hidden',
        border: 'none',
        border: `solid 1px ${this.$root.theme.borderColor}`,
      }),
    ];
  }
}
</script>