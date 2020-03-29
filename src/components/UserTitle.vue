<template>
<div :class="[$style.container, multiLine && 'multi-line', unknownMode && 'unknown-mode']">
  <div class="avatar"> <img :src="avatar" width="100%"/> <i v-if="unknownMode" class="fa fa-question" /> </div>
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
    multiLine: {
      type: Boolean,
      default: false
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
    clearLocalSidIFNeeded() {
      if (this.sid) {
        this.localSid = undefined;
      }
    },
    handlePlayMode() {
      const runTimer = () => {
        this.randomize();
        this.timer = setTimeout(() => {
          if (this.playMode) {
            runTimer();
          } else {
            this.clearLocalSidIFNeeded();
          }
        }, 300);
      }
      runTimer();
    }
  },
  created() {
    if (this.playMode) {
      this.handlePlayMode();
    }
    if (this.unknownMode) {
      this.randomize()
    }
  },
  watch: {
    playMode(v) {
      if (v) {
        this.handlePlayMode();
      } else {
        this.clearLocalSidIFNeeded();
      }
    },
    unknownMode(v) {
      if (!v) {
        this.clearLocalSidIFNeeded();
      }
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