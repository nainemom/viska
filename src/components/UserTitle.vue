<template>
<div :class="$style.container">
  <div class="avatar"> <img :src="avatar" width="100%"/> </div>
  <div class="name" v-if="showName"> {{ name }} </div>
  <slot />
</div>
</template>

<script>
import { minifyStr, numberHash } from '../../utils/handy.js';

export default {
  props: {
    sid: {
      type: String,
    },
    pid: {
      type: String,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    avatarSize: {
      type: Number,
      default: 40
    }
  },
  computed: {
    name() {
      return ((this.pid ? 'PID-' : 'SID-') + minifyStr(this.pid || this.sid || ''));
    },
    avatar() {
      const avatarIndex = numberHash(this.name, 80);

      return `/avatars/${avatarIndex}.svg`;
    }
  },
  style({ className }) {
    const avatarSize = `${this.avatarSize}px`;
    return [
      className('container', {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',

        '& > .name': {
          marginRight: '8px',
          flexGrow: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
        '& > .avatar': {
          marginRight: this.showName ? '8px' : 0,
          borderRadius: avatarSize,
          padding: '4px 0 0 0',
          width: avatarSize,
          height: avatarSize,
          overflow: 'hidden',
          background: this.$root.theme.avatarBackgroundColor,
        },
      }),
    ];
  }
}
</script>