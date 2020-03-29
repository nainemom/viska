<template>
<Cell :class="[$style.chatItem, chat && chat.isActive ? 'actived' : 'deactived']">
  <div class="">
    <UserTitle :sid="chat ? chat.sid : undefined" :pid="chat ? chat.pd : undefined" :avatarSize="40" />
  </div>
  <div v-if="chat && !chat.isActive" class="message">{{chat && chat.messages.length ? chat.messages[chat.messages.length - 1].message : ''}}</div>
  <div :class="['state', chat && chat.isOnline ? 'online' : 'offline']" />
  <slot />
</Cell>
</template>

<script>
import UserTitle from './UserTitle.vue';
import Cell from './Cell.vue';

export default {
  props: {
    chat: {
      type: Object,
    },
  },
  components: {
    UserTitle,
    Cell,
  },
  methods: {
    goToChat(sid, pid) {
      this.$root.goToChat(sid, pid);
    },
  },
  style({ className }) {
    return [
      className('chatItem', {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16px 8px',
        height: '56px',
        overflow: 'hidden',
        cursor: 'pointer',
        '& > .icon': {
          margin: '0 8px',
        },
        '& > .state': {
          marginRight: '8px',
          width: '10px',
          height: '10px',
          borderRadius: '20px',
          '&.online': {
            background: this.$root.theme.onlineColor,
          },
          '&.offline': {
            backgroundColor: this.$root.theme.grayColor,
          },
        },
        '& > .name': {
          marginRight: '8px',
          flexGrow: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
        '& > .message': {
          flexGrow: 1,
          opacity: 0.9,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'pre',
          textAlign: 'right',
        },
      }),
    ];
  }
}
</script>