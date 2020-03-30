import Vue from 'vue';
import VueComponentStyle from 'vue-component-style';
import VueRouter from 'vue-router';
import Chat from './service/Chat.js';
import notif from './service/notif.js';
import Root from './Root.vue';


Vue.config.productionTip = false;
Vue.use(VueComponentStyle);
Vue.use(VueRouter);

Vue.prototype.$chatService = new Vue(Chat);
Vue.prototype.$notify = notif;

window.$app = new Vue(Root).$mount('#root');
