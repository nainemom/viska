<template>
<div :class="[$style.chatItem, chat && chat.isActive ? 'actived' : 'deactived']">
  <i v-if="chat" class="material-icons icon">{{ chat.pid ? 'person' : 'chat' }}</i>
  <div v-if="chat"  class="name"> {{ minifyStr(chat.pid || chat.sid || '') }} </div>
  <div v-if="chat" :class="['state', chat.isOnline ? 'online' : 'offline']" />
  <div v-if="chat && !chat.isActive" class="message">{{chat.messages.length ? chat.messages[chat.messages.length - 1].message : ''}}</div>
  <slot />
</div>
</template>

<script>
import { minifyStr } from '../../utils/handy.js';

export default {
  props: {
    chat: {
      type: Object,
    },
  },
  methods: {
    minifyStr,
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
        '& > .icon': {
          marginRight: '8px',
          width: '32px',
          height: '32px',
          overflow: 'hidden',
          textAlign: 'center',
          // fontWeight: 'bold',
          // textDecoration: 'underline',
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