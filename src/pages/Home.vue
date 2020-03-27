<template>
<div :class="$style.container">
  <div :class="$style.app">
    <Chats :class="$style.chats" />
    <Chat :class="$style.chat" ref="chat"/>
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
  computed: {
    selectedChatType() {
      return this.$route.params.type;
    },
    selectedChatId() {
      return this.$route.params.id;
    },
  },
  methods: {},
  created() {
    if (this.selectedChatType === 'sid') {
      return this.$router.push('/chats');
    }
    this.$nextTick(() => {
      if (this.selectedChatId) {
        this.$refs.chat.start(this.selectedChatType, this.selectedChatId);
      }
    });
  },
  watch: {
    selectedChatId() {
      // this.$refs.chat.finish();
      this.$refs.chat.start(this.selectedChatType, this.selectedChatId);
      console.log('force updaed')
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
        maxWidth: '1024px',
        margin: '0 auto',
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
          display: this.selectedChatId ? 'none' : 'block',
          backgroundColor: this.$root.theme.backgroundColor,
          width: '100%',
        }),
        className('chat', {
          display: this.selectedChatId ? 'block' : 'none',
        }),
      ]),
      mediaQuery({ minWidth: '961px' }, [
        className('container', {
          padding: '15px 0',
        }),
        className('app', {
          boxShadow: `0 0 30px ${this.$root.theme.shadowColor}`,
          border: `solid 1px ${this.$root.theme.borderColor}`,
        }),
      ]),
    ];
  }
}
</script>