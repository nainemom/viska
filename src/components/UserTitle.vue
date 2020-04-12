<template>
<div :class="[$style.container, multiLine && 'multi-line', !user || !user.type && 'unknown-mode']">
  <div class="avatar">
    <Avatar :name="playModeName || (user ? user.username : '')" :size="avatarSize"/>
  </div>
  <div class="name" v-if="showName && user"> {{ user.type === 'persist' ? '@' : '' }}{{ user.type === 'temporary' ? '!' : '' }}{{ user.username }} </div>
  <slot />
</div>
</template>

<script>
import { minifyStr, numberHash } from '../../utils/handy.js';
import Avatar from '../components/Avatar.vue';

export default {
  components: {
    Avatar,
  },
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
      default: 48
    },
    playMode: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      playModeName: '',
    }
  },
  methods: {
    randomizeLoop() {
      if (this.playMode) {
        this.playModeName = (Math.random() * 3000).toString();
        setTimeout(() => {
          this.randomizeLoop();
        }, 500);
      } else {
        this.playModeName = '';
      }
    }
  },
  created() {
    this.randomizeLoop();
  },
  watch: {
    playMode() {
      this.randomizeLoop();
    },
    user() {
      this.randomizeLoop();
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
          // borderRadius: avatarSize,
          padding: '8px 0',
          lineHeight: 1,
          // width: avatarSize,
          // height: avatarSize,
          overflow: 'hidden',
        },
      }),
    ];
  },
}
</script>