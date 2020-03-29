<template>
<div :class="$style.container">
  <div :class="$style.app">
    <div :class="[$style.chats, chat && 'hidden-on-mobile']">
      <div class="profile padding-bottom-xl padding-top-xl">
        <div class="padding-bottom-lg">
          <UserTitle :sid="$root.sid" :pid="$root.pid" multiLine :avatarSize="64"/>
        </div>
        <div>
          <Button class="size-sm padding-left-lg padding-right-lg" color="default" :disabled="!$root.pid" title="Only Available for PID Users" @click.native="copyLink">
            <b> <i class="fa fa-copy" />  {{ copyToClipboardText }} </b>
          </Button>
          <Button class="size-sm padding-left-lg padding-right-lg" color="default" v-if="$root.pid" @click.native="logout">
            <b> <i class="fa fa-sign-out-alt" />  Exit </b>
          </Button>
        </div>
      </div>
      <Chats />
    </div>
    <Chat :class="[$style.chat, !chat && 'hidden-on-mobile']" :chat="chat"/>
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
      chat: undefined
    }
  },
  computed: {
    selectedChatFromUrl() {
      return this.$route.params.type ? {
        pid: this.$route.params.type === 'pid' ? this.$route.params.id : undefined,
        sid: this.$route.params.type === 'sid' ? this.$route.params.id : undefined,
      } : undefined;
    },
  },
  methods: {
    reloadChatIfNeeded() {
      if (this.selectedChatFromUrl) {
        this.chat = this.$root.upsertChat(this.selectedChatFromUrl.sid, this.selectedChatFromUrl.pid);
        this.$root.activeChat(this.chat);
        this.$root.refreshChat(this.chat);
      } else {
        this.chat = undefined;
      }
    },
    copyLink() {
      copyToClipboard('salam' + Math.random());
      const oldText = this.copyToClipboardText;
      this.copyToClipboardText = 'Copied!';
      setTimeout(() => {
        this.copyToClipboardText = oldText;
      }, 500);
    },
    logout() {
      this.$root.forgotAnything();
      alert('ok')
    }
  },
  created() {
    // if (!this.chatFromUrl.pid && this.this.chatFromUrl.sid) {
    //   return this.$router.push('/chats');
    // }
    this.$nextTick(() => {
      this.reloadChatIfNeeded();
    });
  },
  watch: {
    selectedChatFromUrl() {
      this.reloadChatIfNeeded();
    }
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
        width: '320px',
        minWidth: '320px',
        backgroundColor: this.$root.theme.backgroundColor2,
        borderRight: `solid 1px ${this.$root.theme.borderColor}`,
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
      mediaQuery({ maxWidth: '800px' }, [
        className('chats', {
          display: 'block',
          backgroundColor: this.$root.theme.backgroundColor,
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