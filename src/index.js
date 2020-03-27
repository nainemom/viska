import Vue from 'vue/dist/vue.esm';
import VueComponentStyle from 'vue-component-style';
import Root from './Root.vue';

Vue.config.productionTip = false;
Vue.use(VueComponentStyle);

new Vue(Root).$mount('#root');
