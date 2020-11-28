<template>
  <div>
    <div class="container">
      <install></install>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import { EventBus, RemoteProvider, SyncEngine } from './services';
import Install from './components/Install';

/** @type {Array.<function(Event):void>} */
let listeners = [];

export default {
  name: 'App',

  components: {
    Install
  },

  mounted() {
    document.body.classList.add('app-background');
    document.body.classList.add('has-navbar-fixed-top');
    document.documentElement.setAttribute('theme', 'dark');
  },

  created() {
    listeners.push(EventBus.on('sync.request', () => {
      SyncEngine.execute();
    }));

    document.addEventListener('isUpdateAvailable', (available) => {
      if (available) {
        // Toast
      }
    });


    this.start();
  },

  destroyed() {
    while (listeners.length) {
      const listener = listeners.pop();
      listener.remove();
    }
  },

  methods: {
    afterConnect(connected) {
      if (connected) {
        /** @type {string} */
        const path = this.$route.params.pathMatch;
        if (path === undefined) {
          this.$router.push('/l/');
        }
      } else {
        console.log('Not connected');
      }
    },

    start() {
      RemoteProvider.start(window).then(this.afterConnect);
    },
  }
};
</script>

<style lang="scss">
@import './assets/css/app.scss'
</style>