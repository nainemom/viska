<template>
<div :class="$style.container">
  <router-view></router-view>
  <AuthPopup ref="authPopup"/>
</div>
</template>

<script>
import Vue from 'vue';
import VueRouter from 'vue-router';
import Root from './Root.vue';
import routes from './routes.js';
import AuthPopup from './components/AuthPopup.vue';
import { forEachSync, minifyStr, numberHash } from '../utils/handy.js';

const router = new VueRouter({
  routes,
});

export default {
  router,
  components: {
    AuthPopup,
  },
  data() {
    return {
      theme: {
        // shadeColor: '#353535',
        fillColor: '#333',
        backgroundColor: '#fff',
        backgroundColor2: '#f1f1f1',
        backgroundColor3: '#f2f2f2',
        highlightColor: '#fdfdfd',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        primaryColor: 'linear-gradient(45deg, #3661ff, #341a9c)',
        primaryColorSimple: '#3661ff',
        dangerColor: 'linear-gradient(45deg, #870c12, #e62222)',
        grayColor: '#c7c7c7',
        onlineColor: '#08c353',
        avatarBackgroundColor: '#3661ff',
      }
    }
  },
  methods: {
    openAuthPopup() {
      this.$nextTick(() => {
        this.$refs.authPopup.open();
      });
    },
    getStaticLink(link) {
      return `${process.env.STATIC_URL_PREFIX || ''}${link}`
    },
    notify(title, text, icon, onclick) {
      const show = () => {
        const notification = new Notification('', {
          renotify: true,
          body: `${title}:\n${text}`,
          icon: icon,
          tag: 'msg'
        });
        notification.onclick = onclick;
      }
      if (!('Notification' in window)) {
        return
      } else if (Notification.permission === 'granted') {
        show();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          // Whatever the user answers, we make sure we store the information
          if(!('permission' in Notification)) {
            Notification.permission = permission;
          }
          if (permission === "granted") {
            show();
          }
        });
      }

    },
    calculateName(sid, pid) {
      return ((pid ? 'PID-' : 'SID-') + minifyStr(pid || sid || ''));
    },
    generateAvatar(str) {
      const avatarIndex = numberHash(str, 50) + 1;
      return this.getStaticLink(`/avatars/${avatarIndex}.png`);
    }
  },
  created() {
    this.$chatService.init(process.env.SERVER_URL);
    
    // const server = SocketIo(process.env.SERVER_URL, {
    //   autoConnect: false
    // });

    // this.server = SocketIo.connect(process.env.SERVER_URL, {

    // });
    // this.server.on('connect', this.onConnectionStateChange.bind(this, true));
    // this.server.on('disconnect', this.onConnectionStateChange.bind(this, false));
    // this.server.on('reconnecting', this.onConnectionStateChange.bind(this, null));
    // this.server.on('newMessage', this.onNewMessage);

    // // as this components will create once and there is no destroy event before browser close, so who care about clearInterval:)
    // const reloadLoop = () => {
    //   this.refreshChats().then(() => {
    //     setTimeout(reloadLoop, 5000);
    //   });
    // }
    // reloadLoop();

    // window.onbeforeunload = () => {
    //   if (this.pid) {
    //     localStorage.setItem(`${this.pid}:chats`, JSON.stringify(this.chats));
    //   }
    //   if (process.env.NODE_ENV === 'production') {
    //     return true;
    //   } else {
    //     // do not open are sure window before close
    //     return null;
    //   }
    // };
  },
  mounted() {
    this.openAuthPopup();
  },
  
  style({ custom, className }) {

    const helperClasses = [];
    const baseSize = 8;
    const sizeValues = [0.5, 1, 2, 3];
    ['margin', 'padding'].forEach((propName) => {
      ['sm', 'md', 'lg', 'xl'].forEach((sizeText, sizeIndex) => {
        const value = `${sizeValues[sizeIndex] * baseSize}px`;
        ['', '-left', '-right', '-top', '-bottom', '-x', '-y'].forEach((direction) => {
          const name = `.${propName}${direction}-${sizeText}`;
          if (direction === '-x') {
            helperClasses.push(custom(name, {
              [`${propName}-left`]: value,
              [`${propName}-right`]: value,
            }));
          } else if (direction === '-y') {
            helperClasses.push(custom(name, {
              [`${propName}-top`]: value,
              [`${propName}-bottom`]: value,
            }));
          } else {
            helperClasses.push(custom(name, {
              [`${propName}${direction}`]: value,
            }));
          }
        });
      });
    });

    const heightValues = [4, 5, 6, 7, 8, 9];
    const fontSizeValues = [0.8, 0.9, 1, 1.05, 1.1, 1.15];
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((sizeText, sizeIndex) => {
      helperClasses.push(custom(`.size-${sizeText}`, {
        minHeight: `${heightValues[sizeIndex] * baseSize}px`,
        fontSize: `${fontSizeValues[sizeIndex]}rem`,
      }));
    });

    const containerStyle = {
      height: '100%',
      maxHeight: '100%',
      minHeight: '100%',
      background: this.theme.shadeColor,
      color: this.theme.fillColor,
      fontSize: '16px',
    };
    return [
      custom('*', {
        padding: 0,
        margin: 0,
        touchAction: 'pan-y',
        boxSizing: 'border-box',
        userSelect: 'none',
        '-webkit-overflow-scrolling': 'touch',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        fontFamily: '"Ubuntu Mono", monospace',
      }),
      custom('html, body, #root', containerStyle),
      className('container', containerStyle),
      ...helperClasses,
    ];
  },
}
</script>