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
        primaryColor: '#7949BF',
        dangerColor: '#bd161e',
        grayColor: '#c7c7c7',
        onlineColor: '#08c353',
      }
    }
  },
  methods: {
    openAuthPopup() {
      this.$nextTick(() => {
        this.$refs.authPopup.open();
      });
    },
  created() {
    this.$chatService.init(process.env.SERVER_URL);
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
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((sizeText, sizeIndex) => {
      helperClasses.push(custom(`.size-${sizeText}`, {
        minHeight: `${heightValues[sizeIndex] * baseSize}px`,
      }));
    });

    const fontSizeValues = [0.8, 0.9, 1, 1.15, 1.3, 1.6];
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach((sizeText, sizeIndex) => {
      helperClasses.push(custom(`.text-${sizeText}`, {
        fontSize: `${fontSizeValues[sizeIndex]}rem`,
      }));
    });

    const containerStyle = {
      height: '100%',
      maxHeight: '100%',
      minHeight: '100%',
      background: this.theme.shadeColor,
      color: this.theme.fillColor,
      fontSize: '15px',
    };

    return [
      custom('@font-face', {
        fontFamily: '\'Poppins\'',
        fontStyle: 'normal',
        fontWeight: 'normal',
        src: `local('Poppins SemiBold'), local('Poppins-SemiBold'),
              url('/fonts/poppins-v9-latin-regular.woff2') format('woff2'),
              url('/fonts/poppins-v9-latin-regular.woff') format('woff'),
              url('/fonts/poppins-v9-latin-regular.ttf') format('truetype')`,
      }),
      custom('@font-face', {
        fontFamily: '\'Poppins\'',
        fontStyle: 'normal',
        fontWeight: 'bold',
        src: `local('Poppins SemiBold'), local('Poppins-SemiBold'),
              url('/fonts/poppins-v9-latin-600.woff2') format('woff2'),
              url('/fonts/poppins-v9-latin-600.woff') format('woff'),
              url('/fonts/poppins-v9-latin-600.ttf') format('truetype')`,
      }),
      custom('*', {
        padding: 0,
        margin: 0,
        touchAction: 'pan-y',
        boxSizing: 'border-box',
        userSelect: 'none',
        '-webkit-overflow-scrolling': 'touch',
        '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
        fontFamily: '\'Poppins\', sans-serif',
      }),
      custom('html, body, #root', containerStyle),
      className('container', containerStyle),
      ...helperClasses,
    ];
  },
}
</script>