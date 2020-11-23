<template>
  <div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { connectUsingStoredToken } from './services/remote-provider';
import { EventBus, SyncEngine } from './services';

/** @type {Array.<function(Event):void>} */
let listeners = [];

export default {
  name: 'App',

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
      connectUsingStoredToken().then(this.afterConnect);
    },
  }
};
</script>

<style>
</style>