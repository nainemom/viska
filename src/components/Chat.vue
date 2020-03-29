<template>
<div :class="$style.container">
  <Cell :class="$style.header" class="size-xl" v-if="chat">
    <Cell class="padding-x-sm size-lg grow" @click.native="goToChat(chat)">
      <div class="padding-x-sm">
        <UserTitle :sid="chat.sid" :pid="chat.pid"/>
      </div>
      <div class="padding-x-sm"><StatusIcon :value="chat.isOnline" /></div>
    </Cell>
    <Button class="size-lg padding-lg" color="transparent" @click.native="closeChat">
      <i class="fa fa-times" /> 
    </Button>
  </Cell>
  <div :class="$style.conversation" class="padding-y-lg" ref="conversation">
    <div v-for="(message, index) in messages" :key="index" :class="[$style.messageItem, message.from]">
      <div class="inside padding-lg margin-y-sm">
        {{ message.message }}
      </div>
    </div>
  </div>
  <MessageForm :class="$style.messageForm" class="padding-x-md padding-y-lg" @submit="sendMessage" v-model="inputText" :disabled="!chat || !chat.isOnline" />
</div>
</template>

<script>
import Cell from './Cell.vue';
import Button from './Button.vue';
import UserTitle from './UserTitle.vue';
import StatusIcon from './StatusIcon.vue';
import MessageForm from './MessageForm.vue';

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
        background: this.$root.theme.backgroundColor,
        borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        // color: '#fff',
        minHeight: '81px', // flex problem
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
      className('messageItem', {
        // marginTop: '15px',
        fontWeight: 'bold',
        width: '100%',
        '& > .inside': {
          // padding: '15px',
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
        // padding: '15px',
        background: this.$root.theme.backgroundColor2,
        borderTop: `solid 1px ${this.$root.theme.borderColor}`,
      }),
    ];
  },
  watch: {
    'messages.length'() {
      this.$nextTick(() => {
        this.$refs.conversation.scrollTo(0, this.$refs.conversation.scrollHeight);
      });
    }
  }
}
</script>