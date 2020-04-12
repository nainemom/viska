<template>
<div :class="$style.container">
  <Cell :class="$style.header" v-if="chat">
    <Cell class="padding-x-sm size-lg grow">
      <div class="padding-x-sm">
        <UserTitle :user="chat.user" :avatarSize="56"/>
      </div>
      <div class="padding-x-sm"><StatusIcon :value="chat.isOnline" /></div>
    </Cell>
    <Button class="size-lg padding-lg padding-x-xl" color="transparent" @click.native="closeChat">
      <i class="fa fa-times" /> 
    </Button>
  </Cell>
  <div :class="$style.conversation" class="padding-top-lg" ref="conversation">
    <div v-for="(message, index) in messages" :key="'m' + index" :class="[$style.messageItem, message.from, calcTextDir(message.body)]">
      <div class="inside padding-top-md padding-x-md margin-y-xs text-md">
        {{ message.body }}
        <div class="info padding-bottom-md padding-top-sm"> {{ message.date | datetime }} </div>
      </div>
    </div>
    <div :class="$style.isTyping" class="padding-sm">
      <span  v-if="itIsTyping">
        {{ chat.user.name }} is typing...
      </span>
    </div>
  </div>
  <MessageForm :class="[$style.messageForm, calcTextDir(inputText)]" class="padding-x-md padding-y-lg" @submit="sendMessage" :value="inputText" @input="onInput" :disabled="!chat" />
</div>
</template>

<script>
import Cell from './Cell.vue';
import Button from './Button.vue';
import UserTitle from './UserTitle.vue';
import StatusIcon from './StatusIcon.vue';
import MessageForm from './MessageForm.vue';
import calcTextDirection from '../../utils/calcTextDirection.js';

export default {
  components: {
    Cell,
    Button,
    UserTitle,
    StatusIcon,
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
      lastIsTypingFlagSent: 0,
      itIsTyping: false,
      isTypingTimer: undefined,
    }
  },
  computed: {
    messages() {
      // return [{"from":"me","message":"salam"},{"from":"its","message":"salam duste khubam"},{"from":"its","message":"chetori?"},{"from":"me","message":"mamnun"},{"from":"me","message":"bebin barname ro paye hasti?"}];
      return this.chat ? this.chat.messages : [];
    },
    pendingMessages() {
      // return [{"from":"me","message":"salam"},{"from":"its","message":"salam duste khubam"},{"from":"its","message":"chetori?"},{"from":"me","message":"mamnun"},{"from":"me","message":"bebin barname ro paye hasti?"}];
      return this.chat ? this.chat.pendingMessages : [];
    },
    its() {
      return this.chat ? this.chat.user : undefined;
    }
  },
  methods: {
    calcTextDir(str) {
      return calcTextDirection(str);
    },
    sendMessage() {
      if (this.chat) {
        const message = this.inputText;
        this.inputText = '';
        this.$chatService.sendMessage(this.chat, message).then();
      }
    },
    onInput(newValue) {
      this.inputText = newValue;
      if (Date.now() > this.lastIsTypingFlagSent + 1000 && this.chat.isOnline) {
        this.lastIsTypingFlagSent = Date.now();
        this.$chatService.sendIsTypingFlag(this.chat);
      }
    },
    closeChat() {
      this.$emit('close');
    },
    scrollToEnd() {
      this.$refs.conversation.scrollTo(0, this.$refs.conversation.scrollHeight);
    }
  },
  mounted() {
    const reloadLoop = () => {
      if (this.chat) {
        this.$chatService.refreshChat(this.chat).then(() => {
          setTimeout(reloadLoop, 5000);
        });
      } else {
        setTimeout(reloadLoop, 5000);
      }
    }
    reloadLoop();
    this.$chatService.$on('isTypingFlag', (user) => {
      if (this.chat && this.chat.user.username === user.username && this.chat.user.type === user.type) {
        this.itIsTyping = true;
        clearTimeout(this.isTypingTimer);
        this.isTypingTimer = setTimeout(() => {
          this.itIsTyping = false;
        }, 5000);
      }
    });
  },
  watch: {
    chat() {
      if (this.chat) {
        this.$chatService.refreshChat(this.chat);
        this.chat.badge = 0;
        this.$chatService._saveChats();
      }
      this.ItIsTyping = false;
      clearTimeout(this.isTypingTimer);
    },
    'messages.length'() {
      this.itIsTyping = false;
      this.$nextTick(() => {
        this.scrollToEnd();
      });
    },
    'pendingMessages.length'() {
      this.$nextTick(() => {
        this.scrollToEnd();
      });
    },
    itIsTyping(itIsTyping) {
      if (itIsTyping) {
        this.$nextTick(() => {
          this.scrollToEnd();
        });
      }
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
        background: this.$root.theme.backgroundColor,
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        // color: '#fff',
        // minHeight: '81px', // flex problem
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        '& > .name': {
          flexGrow: 1,
        },
        '& > .close-button': {
          width: '48px',
          height: '48px',
          // borderRadius: '8px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
        }
      }),
      className('conversation', {
        flexGrow: 1,
        overflowY: 'scroll',
        overflowX: 'hidden',
        background: this.$root.theme.backgroundColor,
        // paddingBottom: '15px',
        overflowWrap: 'break-word',
        lineHeight: 1.5,
      }),
      className('isTyping', {
        position: 'sticky',
        bottom: 0,
        backgroundColor: this.$root.theme.backgroundColor,
      }),
      className('messageItem', {
        userSelect: 'none',
        // fontWeight: 'bold',
        width: '100%',
        '&.rtl': {
          direction: 'rtl',
        },
        '& > .inside': {
          // fontSize: '22px',
          // padding: '15px',
          maxWidth: '70%',
          display: 'inline-block',
          overflow: 'hidden',
          userSelect: 'text',
          minWidth: '100px',
          '& > .info': {
            opacity: 0.5,
            fontSize: '10px',
            textAlign: 'left',
            display: 'block',
          },
          '&:hover > .info': {
            display: 'block'
          }
        },
        '&.its': {
          textAlign: 'left',
          '& > .inside': {
            background: this.$root.theme.shadowColor,
            color: '#111',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            '& > .info': {
              textAlign: 'right',
            }
          }
        },
        '&.me': {
          textAlign: 'right',
          '& > .inside': {
            background: this.$root.theme.primaryColor,
            color: '#fff',
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
          }
        },

      }),
      className('messageForm', {
        // padding: '15px',
        background: this.$root.theme.backgroundColor2,
        borderTop: `solid 1px ${this.$root.theme.borderColor}`,
        flexShrink: 0,
        '&.rtl input': {
          direction: 'rtl',
        }
      }),
    ];
  },
}
</script>