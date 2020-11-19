<template>
  <div>
    <div class="container">
      <router-view></router-view>

      <b-modal v-model="showConsole" has-modal-card full-screen :can-cancel="true">
        <div class="modal-card">
          <header class="modal-card-head">
            Console
          </header>
          <section class="modal-card-body">
            <console v-bind:logMessages="log.messages"></console>
          </section>
          <footer class="modal-card-foot">
            <button class="button" type="button" @click="showConsole = false">Close</button>
          </footer>
        </div>
      </b-modal>
    </div>
  </div>
</template>

<script>
import Console from './components/Console.vue';
import EventBus from './classes/event-bus';
import { connect } from './classes/remote-provider';
import { SyncEngine } from './classes/service';

/** @type {Array.<function(Event):void>} */
let listeners = [];

export default {
  name: 'App',
  components: {
    Console,
  },

  data() {
    return {
      showConsole: false,

      /** {Array.<string>} */
      log: {
        messages: []
      }
    };
  },

  created() {
    listeners.push(EventBus.on('console', e => {
      this.log.messages.splice(0, 0, e.data);
    }));
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
    start() {
      connect(window).then(connected => {
        /** @type {string} */
        const path = this.$route.params.pathMatch;
        if (connected && path === undefined) {
          this.$router.push('/l/');
        }
      });
    },
  }
};
</script>

<style>
</style>