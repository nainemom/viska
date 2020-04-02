<template>
<div :class="$style.container">
  <div :class="$style.chatList">
    <Cell class="padding-x-sm size-lg" :class="[$style.chatItem]" @click.native="connetToRandomUser">
      <div class="padding-x-sm">
        <UserTitle :showName="false" :playMode="loadingRandomChat" />
      </div>
      <div class="padding-x-sm grow" v-if="!loadingRandomChat"> Talk to a Random User </div>
      <div class="padding-x-sm grow" v-else> Looking for a Random User... </div>
    </Cell>

    <Cell class="padding-x-sm size-lg" :class="[$style.chatItem, isActive(chat) && 'actived']" v-for="(chat, index) in chats" :key="index" @click.native="goToChat(chat)">
      <div class="padding-x-sm grow">
        <UserTitle :user="chat.user"/>
      </div>
      <div class="padding-x-sm"><StatusIcon :value="chat.isOnline" /></div>
    </Cell>
  </div>
</div>
</template>

<script>
import ChatListItem from './ChatListItem.vue';
import UserTitle from './UserTitle.vue';
import Cell from './Cell.vue';
import StatusIcon from './StatusIcon.vue';

export default {
  components: {
    ChatListItem,
    UserTitle,
    Cell,
    StatusIcon,
  },
  props: {
    activeChat: {
      type: Object,
    },
  },
  data() {
    return {
      loadingRandomChat: false,
    }
  },
  computed: {
    chats() {
      return this.$chatService.chats;
    },
  },
  methods: {
    connetToRandomUser() {
      if (this.loadingRandomChat) {
        return;
      }
      this.loadingRandomChat = true;
      const done = (chat) => {
        this.loadingRandomChat = false;
        this.goToChat(chat);
      }
      setTimeout(() => {
        this.$chatService.connetToRandomUser().then(done).catch((e) => {
          if (e === 'promise') {
            this.$chatService.$once('connetedToRandomUser', done)
          } else {
            this.loadingRandomChat = false;
          }
        });
      }, 500);
    },
    isActive(chat) {
      return this.activeChat && chat.user.xid === this.activeChat.user.xid && chat.user.type === this.activeChat.user.type;
    },
    goToChat(chat) {
      this.$emit('select', chat);
      // const path = `/chats/${chat.user.type}/${chat.user.xid}`;
      // if (this.$route.path !== path) {
      //   this.$router.push(path);
      // }
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