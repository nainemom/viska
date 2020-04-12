<template>
<div :class="$style.container">
  <div :class="$style.app">
    <div :class="[$style.chats, activeChat && 'hidden-on-mobile']">
      <div class="profile padding-bottom-xl padding-top-xl">
        <div class="padding-bottom-lg">
          <UserTitle :user="$chatService.user" multiLine :avatarSize="128"/>
        </div>
        <div>
          <Button class="size-sm padding-left-lg padding-right-lg" color="default" :disabled="$chatService.user.type !== 'persist'" title="This feature isn't available for anonymous accounts." @click.native="copyLink">
            <b> <i class="fa fa-share" />  {{ copyToClipboardText }} </b>
          </Button>
          <Button class="size-sm padding-left-lg padding-right-lg" color="default" v-if="$chatService.user.type" @click.native="logout">
            <b> <i class="fa fa-sign-out-alt" />  Exit </b>
          </Button>
        </div>
      </div>
      <Chats :activeChat="activeChat" @select="goToChat($event.user.type, $event.user.username)"/>
    </div>
    <Chat :class="[$style.chat, !activeChat && 'hidden-on-mobile']" :chat="activeChat" @close="goToChat(undefined, undefined)"/>
  </div>
</div>
</template>

<script>
import { copyToClipboard } from '../../utils/handy.js';
import Button from '../components/Button.vue';
import UserTitle from '../components/UserTitle.vue';
import Chats from '../components/Chats.vue';
import Chat from '../components/Chat.vue';

export default {
  components: {
    Button,
    UserTitle,
    Chats,
    Chat,
  },
  data() {
    return {
      copyToClipboardText: 'Share My Direct Link',
    }
  },
  computed: {
    activeChat() {
      if (this.$route.params.user) {
        const type = this.$route.params.user.substr(0, 1) === '@' ? 'persist' : 'temporary';
        const username = this.$route.params.user.substr(1);
        return this.$chatService.getChat({
          type,
          username,
        });
      }
      return undefined;
    },
  },
  methods: {
    goToChat(type, username) {
      const url = type ? `/chats/${type === 'persist' ? '@' : '!'}${username}` : '/chats';
      if (this.$route.path !== url) {
        this.$nextTick(() => {
          this.$router.push(url);
        });
      }
    },
    copyLink() {
      copyToClipboard(`${location.protocol}//${location.host}/#/chats/${this.$chatService.user.type === 'persist' ? '@' : '!'}${this.$chatService.user.username}`);
      const oldText = this.copyToClipboardText;
      this.copyToClipboardText = 'Copied to Clipboard!';
      setTimeout(() => {
        this.copyToClipboardText = oldText;
      }, 750);
    },
    logout() {
      // TODO use a better way
      this.$root.$refs.authPopup.openLogout();
    },
  },
  created() {
    this.$chatService.$on('newMessage', ({user, body}) => {
      const hasFocus = document.hasFocus();
      const isOnChatPage = this.activeChat && this.activeChat.user.type === user.type && this.activeChat.user.username === user.username;

      if (!isOnChatPage || !hasFocus) {
        this.$notify(user.username, body, 'message', true, !hasFocus, () => {
          window.focus();
          this.goToChat(user.type, user.username);
        });
      }
      if (!isOnChatPage) {
        const theChat = this.$chatService.getChat({
          type: user.type,
          username: user.username,
        });
        theChat.badge++;
        this.$chatService._saveChats();
      }
    });
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        height: '100%',
      }),
      className('app', {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        overflow: 'hidden',
        background: this.$root.theme.backgroundColor,
      }),
      className('chats', {
        height: '100%',
        width: '340px',
        minWidth: '340px',
        backgroundColor: this.$root.theme.backgroundColor2,
        borderRight: `solid 1px ${this.$root.theme.borderColor}`,
        boxShadow: `inset -4px 0 9px ${this.$root.theme.shadowColor}`,
        '& > .profile': {
          textAlign: 'center',
          borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
        }
      }),
      className('chat', {
        flexGrow: 1,
        width: '100%',
        overflow: 'hidden',
      }),
      mediaQuery({ maxWidth: '960px' }, [
        className('chats', {
          display: 'block',
          backgroundColor: this.$root.theme.backgroundColor,
          boxShadow: 'none',
          width: '100%',
          '&.hidden-on-mobile': {
            display: 'none',
          }
        }),
        className('chat', {
          '&.hidden-on-mobile': {
            display: 'none',
          }
        }),
      ]),
    ];
  }
}
</script>