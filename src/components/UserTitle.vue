<template>
<div :class="[$style.container, multiLine && 'multi-line', !user || !user.type && 'unknown-mode']">
  <div class="avatar"> <img v-if="user" :src="user.avatar" width="100%"/> <i v-if="!user || !user.type" class="fa fa-question" /> </div>
  <div class="name" v-if="showName && user"> {{ user.name }} </div>
  <slot />
</div>
</template>

<script>
import { minifyStr, numberHash } from '../../utils/handy.js';

export default {
  props: {
    user: {
      type: Object,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    multiLine: {
      type: Boolean,
      default: false
    },
    avatarSize: {
      type: Number,
      default: 40
    },
  },
  style({ className }) {
    const avatarSize = `${this.avatarSize}px`;
    return [
      className('container', {
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        verticalAlign: 'middle',
        '&.multi-line': {
          flexDirection: 'column',
          '& > .name': {
            marginTop: '8px',
          }
        },
        '& > .name': {
          marginRight: '8px',
          flexGrow: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
        '& > .avatar': {
          position: 'relative',
          marginRight: this.showName ? '8px' : 0,
          borderRadius: avatarSize,
          padding: '4px 0 0 0',
          width: avatarSize,
          height: avatarSize,
          overflow: 'hidden',
          background: this.$root.theme.avatarBackgroundColor,
          '& > i': {
            position: 'absolute',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            textAlign: 'center',
            lineHeight: avatarSize,
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
          }
        },
      }),
    ];
  },
}
</script>