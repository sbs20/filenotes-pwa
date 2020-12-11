import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';

import App from './App.vue';
import About from './components/About';
import Console from './components/Console';
import File from './components/File';
import List from './components/List';
import Settings from './components/Settings';
import Search from './components/Search';
import Start from './components/Start';
import VueAudioVisual from 'vue-audio-visual';

import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import 'fontsource-cascadia-code';

import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);
Vue.use(Vuetify);

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
  vuetify: new Vuetify({}),
  router: router,
  render: h => h(App),
}).$mount('#app');
