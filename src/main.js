import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import About from './components/About';
import Console from './components/Console';
import File from './components/File';
import List from './components/List';
import Settings from './components/Settings';
import Search from './components/Search';
import Start from './components/Start';
import VueAudioVisual from 'vue-audio-visual';

import '@mdi/font/css/materialdesignicons.css';
import './styles/cascadia.css';

import './registerServiceWorker';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);

const router = new VueRouter({
  routes: [
    { path: '/about', component: About },
    { path: '/console', component: Console },
    { path: '/file*', component: File },
    { path: '/list*', component: List },
    { path: '/search/:query', component: Search },
    { path: '/search', component: Search },
    { path: '/start', component: Start },
    { path: '/settings', component: Settings },
  ]
});

new Vue({
  vuetify,
  router: router,
  render: h => h(App)
}).$mount('#app');
