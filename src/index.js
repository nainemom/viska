Promise.all([
  import(/* webpackChunkName: "vue" */ 'vue'),
  import(/* webpackChunkName: "vue-router" */ 'vue-router'),
  import(/* webpackChunkName: "vue-component-style" */ 'vue-component-style'),
  import(/* webpackChunkName: "chat" */ './service/Chat.js'),
  import(/* webpackChunkName: "notif" */ './service/notif.js'),
  import(/* webpackChunkName: "app" */ './Root.vue'),
]).then(([
  { default: Vue },
  { default: VueRouter },
  { default: VueComponentStyle },
  { default: Chat },
  { default: notif },
  { default: Root },
]) => {
  Vue.config.productionTip = false;
  Vue.use(VueComponentStyle);
  Vue.use(VueRouter);
  Vue.prototype.$chatService = new Vue(Chat);
  Vue.prototype.$notify = notif;
  window.$app = new Vue(Root).$mount('#root');
});