Promise.all([
  import(/* webpackChunkName: "offline-plugin" */ "offline-plugin/runtime"),
  import(/* webpackChunkName: "vue" */ "vue"),
  import(/* webpackChunkName: "vue-router" */ "vue-router"),
  import(/* webpackChunkName: "vue-component-style" */ "vue-component-style"),
  import(/* webpackChunkName: "chat" */ "./service/Chat.js"),
  import(/* webpackChunkName: "notif" */ "./service/notif.js"),
  import(/* webpackChunkName: "connection" */ "./service/Connection.js"),
  import(/* webpackChunkName: "app" */ "./Root.vue")
]).then(
  ([
    { default: OfflinePluginRuntime },
    { default: Vue },
    { default: VueRouter },
    { default: VueComponentStyle },
    { default: Chat },
    { default: notif },
    { default: Connection },
    { default: Root }
  ]) => {
    if (process.env.NODE_ENV === "production") {
      OfflinePluginRuntime.install({
        onInstalled: function() {
          console.log("sw installed");
        },
        onUpdating: function() {
          console.log("updating sw...");
        },

        onUpdateReady: function() {
          OfflinePluginRuntime.applyUpdate();
        },
        onUpdated: function() {
          window.location.reload();
        }
      });
    }

    Vue.config.productionTip = false;
    Vue.use(VueComponentStyle);
    Vue.use(VueRouter);
    Vue.filter("datetime", date => {
      const dt = new Date(date);
      const now = new Date();
      const isToday =
        dt.getDate() === now.getDate() &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear();
      const dateStr = `${dt.getFullYear()}-${(dt.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${dt
        .getDate()
        .toString()
        .padStart(2, 0)}`;
      return `${isToday ? "" : dateStr} ${dt
        .getHours()
        .toString()
        .padStart(2, 0)}:${dt
        .getMinutes()
        .toString()
        .padStart(2, 0)}:${dt
        .getSeconds()
        .toString()
        .padStart(2, 0)}`;
    });
    Vue.prototype.$chatService = new Vue(Chat);
    Vue.prototype.$notify = notif;
    Vue.prototype.$connection = new Vue(Connection);
    window.$app = new Vue(Root).$mount("#root");
  }
);
