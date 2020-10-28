import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import './registerServiceWorker'

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/f/*', component: App },
    { path: '/auth/*', component: App },
    { path: '/', component: App },
  ]
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app')
