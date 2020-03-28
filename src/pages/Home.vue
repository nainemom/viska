<template>
<div :class="$style.container">
  <div :class="$style.app">
    <Chats :class="[$style.chats, chat && 'hidden-on-mobile']" />
    <Chat :class="[$style.chat, !chat && 'hidden-on-mobile']" :chat="chat"/>
  </div>
</div>
</template>

<script>
import Chats from '../components/Chats.vue';
import Chat from '../components/Chat.vue';

export default {
  components: {
    Chats,
    Chat,
  },
  data() {
    return {
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
        backgroundColor: this.$root.theme.backgroundColor2,
        borderRight: `solid 1px ${this.$root.theme.borderColor}`,
      }),
      className('chat', {
        flexGrow: 1,
      }),
      mediaQuery({ maxWidth: '960px' }, [
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