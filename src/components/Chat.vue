<template>
<div :class="$style.container">
  <div :class="$style.header">
    <ChatListItem class="name" :chat="chat" />
    <button class="close-button" v-if="chat" @click="closeChat">
      <i class="material-icons">clear</i>
    </button>
  </div>
  <div :class="$style.conversation">
    <div v-for="(message, index) in messages" :key="index" :class="[$style.messageItem, message.from]">
      <div class="inside">
        {{ message.message }}
      </div>
    </div>
  </div>
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
      // return [{"from":"me","message":"salam"},{"from":"its","message":"salam duste khubam"},{"from":"its","message":"chetori?"},{"from":"me","message":"mamnun"},{"from":"me","message":"bebin barname ro paye hasti?"}];
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
        background: this.$root.theme.primaryColorDeep,
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        // color: '#fff',
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
        overflowX: 'hidden',
        background: this.$root.theme.backgroundColor,
      }),
      className('messageItem', {
        marginTop: '15px',
        fontWeight: 'bold',
        width: '100%',
        '& > .inside': {
          padding: '15px',
          maxWidth: '70%',
          display: 'inline-block',
          overflow: 'hidden',
        },
        '&.its': {
          textAlign: 'left',
          '& > .inside': {
            background: this.$root.theme.shadowColor,
            color: '#111',
            borderTopRightRadius: '24px',
            borderBottomRightRadius: '24px',
          }
        },
        '&.me': {
          textAlign: 'right',
          '& > .inside': {
            background: this.$root.theme.primaryColor,
            color: '#fff',
            borderTopLeftRadius: '24px',
            borderBottomLeftRadius: '24px',
          }
        },

      }),
      className('messageForm', {
        padding: '15px',
        background: this.$root.theme.backgroundColor2,
        borderTop: `solid 1px ${this.$root.theme.borderColor}`,
      }),
    ];
  }
}
</script>