import Vue from 'vue';
import VueComponentStyle from 'vue-component-style';
import VueRouter from 'vue-router';
import Root from './Root.vue';


Vue.config.productionTip = false;
Vue.use(VueComponentStyle);
Vue.use(VueRouter);


new Vue(Root).$mount('#root');
