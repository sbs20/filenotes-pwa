import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import File from './components/File';
import List from './components/List';
import VueAudioVisual from 'vue-audio-visual';
import {
  MdApp,
  MdButton,
  MdCard,
  MdContent,
  MdDialog,
  MdField,
  MdIcon,
  MdList,
  MdMenu,
  MdRipple,
  MdSpeedDial,
  MdToolbar } from 'vue-material/dist/components';

import 'vue-material/dist/vue-material.min.css';
//import 'vue-material/dist/theme/default.css';
import 'vue-material/dist/theme/default-dark.css';

import './registerServiceWorker';

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueAudioVisual);
Vue.use(MdApp);
Vue.use(MdCard);
Vue.use(MdContent);
Vue.use(MdDialog);
Vue.use(MdField);
Vue.use(MdIcon);
Vue.use(MdList);
Vue.use(MdMenu);
Vue.use(MdButton);
Vue.use(MdRipple);
Vue.use(MdSpeedDial);
Vue.use(MdToolbar);


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
