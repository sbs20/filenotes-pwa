<template>
  <div>
    <div class="container">
      <install></install>
      <router-view></router-view>
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

  created() {
    listeners.push(EventBus.on('sync.request', () => {
      SyncEngine.execute();
    }));

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

<style>
</style>