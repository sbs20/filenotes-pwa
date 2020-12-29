import Vue, { CreateElement, VNode } from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import About from './components/About.vue';
import Console from './components/Console.vue';
import File from './components/File.vue';
import List from './components/List.vue';
import Settings from './components/Settings.vue';
import Search from './components/Search.vue';
import VueAudioVisual from 'vue-audio-visual';

import '@mdi/font/css/materialdesignicons.css';
import './styles/cascadia.css';
import './styles/overrides.css';

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
    { path: '/settings', component: Settings },
  ]
});

new Vue({
  vuetify,
  router: router,
  render: (h: CreateElement): VNode => h(App)
}).$mount('#app');
