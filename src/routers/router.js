// import Vue from "vue";
// import VueRouter from "vue-router";

import _HRM from '@router/_HRM';

Vue.use(VueRouter);
const Routers = new VueRouter({
  mode: "history",
  routes: [
    ..._HRM
  ]
});

Routers.beforeEach(async (to, from, next) => {
  
  next();
});
Routers.onError(() => {
  $Notif({
    type: `error`,
    title: "提示",
    message: "网络错误或服务器异常"
  });
});
export default Routers;
