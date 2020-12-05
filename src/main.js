import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import About from './components/About';
import Console from './components/Console';
import File from './components/File';
import List from './components/List';
import Settings from './components/Settings';
import Start from './components/Start';
import VueAudioVisual from 'vue-audio-visual';
import Buefy from 'buefy';

// https://github.com/buefy/buefy/issues/1500
import '@mdi/font/css/materialdesignicons.css';
import 'fontsource-cascadia-code';

import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);
Vue.use(Buefy);

const router = new VueRouter({
  routes: [
    { path: '/about', component: About },
    { path: '/console', component: Console },
    { path: '/f/*', component: File },
    { path: '/l/*', component: List },
    { path: '/start', component: Start },
    { path: '/settings', component: Settings },
  ]
});

new Vue({
  router: router,
  render: h => h(App),
}).$mount('#app');
