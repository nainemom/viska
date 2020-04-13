<template>
<div :class="$style.container">
  <div :class="$style.app">
    <div :class="[$style.chats, activeChat && 'hidden-on-mobile']">
      <div class="profile padding-bottom-lg padding-top-md">
        <div class="padding-bottom-lg">
          <div class="padding-bottom-sm">
            <UserAvatar :user="$chatService.user" :size="96" />
          </div>
          <b>
            <UserName :user="$chatService.user" />
          </b>
        </div>
        <Cell class="buttons">
          <Button class="size-sm padding-left-lg padding-right-lg" color="light" :disabled="$chatService.user.type !== 'persist'" title="This feature isn't available for anonymous accounts." @click.native="copyLink">
            <b> <i class="fa fa-share" />  {{ copyToClipboardText }} </b>
          </Button>
          <span class="padding-left-sm" />
          <Button class="size-sm padding-left-lg padding-right-lg" color="light" v-if="$chatService.user.type" @click.native="logout">
            <b> <i class="fa fa-sign-out-alt" />  Exit </b>
          </Button>
        </Cell>
      </div>
      <Chats :activeChat="activeChat" @select="goToChat($event.user.type, $event.user.username)"  @add="goToChat($event.type, $event.username)"/>
      <Cell class="padding-x-md app-info text-sm size-sm">
        <div class="grow"> <i class="fa fa-code-branch" /> {{packageVersion}} </div>
        <div> <a href="https://github.com/nainemom/viska/issues" target="_blank"> <i class="fa fa-bug" /> Report Bug </a> </div>
      </Cell>
    </div>
    <Chat :class="[$style.chat, !activeChat && 'hidden-on-mobile']" :chat="activeChat" @close="goToChat(undefined, undefined)" @remove="removeChat(activeChat)"/>
  </div>
</div>
</template>

<script>
import { copyToClipboard } from '../../utils/handy.js';
import Button from '../components/Button.vue';
import Chats from '../components/Chats.vue';
import Chat from '../components/Chat.vue';
import Cell from '../components/Cell.vue';
import UserAvatar from '../components/UserAvatar.vue';
import UserName from '../components/UserName.vue';

export default {
  components: {
    Button,
    UserAvatar,
    UserName,
    Chats,
    Chat,
    Cell,
  },
  data() {
    return {
      copyToClipboardText: 'Share My Direct Link!',
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
    packageVersion() {
      return process.env.PKG_VER;
    }
  },
  methods: {
    goToChat(type, username) {
      const url = type ? `/${type === 'persist' ? '@' : '!'}${username}` : '/';
      if (this.$route.path !== url) {
        this.$nextTick(() => {
          this.$router.push(url);
        });
      }
    },
    removeChat(chat) {
      this.goToChat(undefined, undefined);
      this.$chatService.deleteChat(chat);
    },
    copyLink() {
      copyToClipboard(`${location.protocol}//${location.host}/#/${this.$chatService.user.type === 'persist' ? '@' : '!'}${this.$chatService.user.username}`);
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
        width: '324px',
        minWidth: '320px',
        backgroundColor: this.$root.theme.backgroundColor2,
        borderRight: `solid 1px ${this.$root.theme.borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        // boxShadow: `inset -4px 0 9px ${this.$root.theme.shadowColor}`,
        '& > .profile': {
          textAlign: 'center',
          borderBottom: `solid 1px ${this.$root.theme.borderColor}`,
          backgroundColor: this.$root.theme.primaryColor,
          color: this.$root.theme.backgroundColor,
          '& > .buttons': {
            display: 'inline-flex',
          }
        },
        '& > .app-info': {
          // backgroundColor: this.$root.theme.borderColor,
          borderTop: `solid 1px ${this.$root.theme.borderColor}`,
          '&, & a, & a:visited': {
            color: this.$root.theme.fillColor,
            textDecoration: 'none',
          }
        }
      }),
      className('chat', {
        flexGrow: 1,
        width: '100%',
        overflow: 'hidden',
      }),
      mediaQuery({ maxWidth: '960px' }, [
        className('chats', {
          backgroundColor: this.$root.theme.backgroundColor,
          boxShadow: 'none',
          width: '100%',
          borderRight: 'none',
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