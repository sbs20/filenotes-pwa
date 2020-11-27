import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Console from './components/Console';
import File from './components/File';
import List from './components/List';
import VueAudioVisual from 'vue-audio-visual';
import Buefy from 'buefy';

import 'buefy/dist/buefy.css';

// https://github.com/buefy/buefy/issues/1500
import '@mdi/font/css/materialdesignicons.css';

import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);
Vue.use(Buefy);

const router = new VueRouter({
  routes: [
    { path: '/console', component: Console },
    { path: '/f/*', component: File },
    { path: '/l/*', component: List }
  ]
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app');
