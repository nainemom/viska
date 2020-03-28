<template>
<div :class="$style.container">
  <div :class="$style.header">
    <ChatListItem class="name" :chat="chat" />
    <button class="close-button" v-if="chat" @click="closeChat"> X </button>
  </div>
  <ul :class="$style.conversation">
    <li v-for="(message, index) in messages" :key="index">
      <div>
        {{ message.from }}:
        {{ message.message }}
      </div>
    </li>
  </ul>
  <MessageForm :class="$style.messageForm" @submit="sendMessage" v-model="inputText" :disabled="!chat || !chat.isOnline" />
</div>
</template>

<script>
import ChatListItem from './ChatListItem.vue';
import MessageForm from './MessageForm.vue';

export default {
  components: {
    ChatListItem,
    MessageForm,
  },
  props: {
    chat: {
      type: Object,
    },
  },
  data() {
    return {
      inputText: '',
    }
  },
  computed: {
    messages() {
      return this.chat ? this.chat.messages : [];
    }
  },
  methods: {
    sendMessage() {
      if (this.chat) {
        this.$root.sendMessage(this.chat.sid, this.chat.pid, this.inputText).then(() => {
          this.inputText = '';
        });
      }
    },
    closeChat() {
      this.$router.push('/chats');
      this.$root.activeChat(null);
    }
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }),
      className('header', {
        // backgroundColor: this.$root.theme.backgroundColor2,
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        height: '48px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        '& > .name': {
          flexGrow: 1,
        },
        '& > .close-button': {
          width: '48px',
          height: '48px',
          // borderRadius: '8px',
          border: 'none',
          borderLeft: `solid 1px ${this.$root.theme.borderColor}`,
          backgroundColor: this.$root.theme.backgroundColor2,
          color: this.$root.theme.fillColor,
          cursor: 'pointer',
        }
      }),
      className('conversation', {
        flexGrow: 1,
        overflowY: 'scroll',
      }),
      className('messageForm', {
        padding: '15px',
        // backgroundColor: this.$root.theme.backgroundColor2,
        borderTop: `solid 1px ${this.$root.theme.borderColor}`,
      }),
    ];
  }
}
</script>