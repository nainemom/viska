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
    },
    playMode: {
      type: Boolean,
      default: false
    },
    unknownMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localSid: undefined,
      timer: undefined,
    }
  },
  computed: {
    name() {
      return ((this.pid ? 'PID-' : 'SID-') + minifyStr(this.localPid || this.localSid || this.pid || this.sid || ''));
    },
    avatar() {
      const avatarIndex = numberHash(this.name, 80) + 1;

      return `/avatars/${avatarIndex}.svg`;
    }
  },
  methods: {
    randomize() {
      let str = (Date.now() * 35413).toString();
      if (Math.random() > 0.5) {
        str = str.split('').reverse().join('');
      }
      this.localSid = str;
    },
  },
  created() {
    if (this.playMode) {
      const runTimer = () => {
        this.randomize();
        this.timer = setTimeout(() => {
          runTimer();
        }, 500);
      }
      runTimer();
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
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
  },
}
</script>