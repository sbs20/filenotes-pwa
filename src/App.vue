<template>
  <div>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import EventBus from './classes/event-bus';
import { connectUsingStoredToken } from './classes/remote-provider';
import { SyncEngine } from './classes/service';

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