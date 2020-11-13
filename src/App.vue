<template>
  <md-app>
    <md-app-toolbar class="md-primary">
      <div class="md-toolbar-section-start">
        <span class="md-title">Filenotes</span>
      </div>
      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button" @click="showConsole = true">
          <md-icon>computer</md-icon>
        </md-button>
        <md-button class="md-icon-button" @click="sync">
          <md-icon>refresh</md-icon>
        </md-button>
      </div>
    </md-app-toolbar>
    <md-app-content>
      <router-view></router-view>
      <md-dialog :md-active.sync="showConsole">
        <md-dialog-title>Console</md-dialog-title>
        <md-dialog-content>
          <console v-bind:logMessages="log.messages"></console>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="showConsole = false">Close</md-button>
        </md-dialog-actions>
      </md-dialog>
    </md-app-content>
  </md-app>
</template>

<script>
import Console from './components/Console.vue';
import EventBus from './classes/event-bus';
import { connect } from './classes/remote-provider';
import { SyncEngine } from './classes/service';

let listener = null;

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
    listener = EventBus.on('console', e => {
      this.log.messages.splice(0, 0, e.data);
    });
    this.start();
  },
  destroyed() {
    if (listener) {
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

    sync() {
      SyncEngine.execute();
    }
  }
};
</script>

<style>
</style>