import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import File from './components/File';
import List from './components/List';
import VueAudioVisual from 'vue-audio-visual';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';


import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);
Vue.use(Buefy);

const router = new VueRouter({
  routes: [
    { path: '/f/*', component: File },
    { path: '/l/*', component: List }
  ]
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app');
