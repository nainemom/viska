<template>
<div :class="$style.container">
  <div :class="$style.chatList">
    <Cell class="padding-x-sm size-lg" :class="[$style.chatItem]" @click.native="pickRandomUserForChat">
      <div class="padding-x-sm">
        <UserTitle :showName="false" :unknownMode="!loadingRandomUser" :playMode="loadingRandomUser"/>
      </div>
      <div class="padding-x-sm grow">Talk to a Random User </div>
      <div class="padding-x-sm"><StatusIcon v-if="loadingRandomUser" :value="null" /></div>
    </Cell>

    <Cell class="padding-x-sm size-lg" :class="[$style.chatItem, chat.isActive && 'actived']" v-for="chat in chats" :key="chat.pid || chat.sid" @click.native="goToChat(chat)">
      <div class="padding-x-sm grow">
        <UserTitle :sid="chat.sid" :pid="chat.pid"/>
      </div>
      <div class="padding-x-sm"><StatusIcon :value="chat.isOnline" /></div>
    </Cell>


<!-- <Cell :class="[$style.chatItem, chat && chat.isActive ? 'actived' : 'deactived']">
  <div class="">
    <UserTitle :sid="chat ? chat.sid : undefined" :pid="chat ? chat.pd : undefined" :avatarSize="40" />
  </div>
  <div v-if="chat && !chat.isActive" class="message">{{chat && chat.messages.length ? chat.messages[chat.messages.length - 1].message : ''}}</div>
  <div :class="['state', chat && chat.isOnline ? 'online' : 'offline']" />
  <slot />
</Cell>


    <ChatListItem v-for="chat in chats" :key="chat.pid || chat.sid" :chat="chat" @click.native="goToChat(chat)" :class="$style.chatItem" /> -->
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
  data() {
    return {
      loadingRandomUser: false,
    }
  },
  computed: {
    chats() {
      return this.$root.chats;
    },
  },
  methods: {
    pickRandomUserForChat() {
      this.loadingRandomUser = true;
      setTimeout(() => {
        this.$root.upsertRandomChat().then((chat) => {
          this.loadingRandomUser = false;
          this.goToChat(chat);
        }).catch(() => {
          this.loadingRandomUser = false;
          alert('It seems there is no one wants to chat with you :(');
        });
      }, 1000);
    },
    goToChat(chat) {
      this.$root.activeChat(chat);
      const path = `/chats/${chat.pid ? 'pid' : 'sid'}/${chat.pid || chat.sid}`;
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
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