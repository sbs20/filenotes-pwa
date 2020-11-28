<template>
  <div>
    <div class="container">
      <install></install>
      <div id="progress" v-if="progress.show">
        <b-progress type="is-primary" size="is-small" :value="progress.value" show-value></b-progress>
      </div>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import { Log, RemoteProvider, SyncEngine } from './services';
import Install from './components/Install';

const log = Log.get('App');

/** @type {Array.<function(Event):void>} */
let listeners = [];

export default {
  name: 'App',

  components: {
    Install
  },

  data() {
    return {
      progress: {
        show: false,
        value: 0
      }
    };
  },

  mounted() {
    document.body.classList.add('app-background');
    document.body.classList.add('has-navbar-fixed-top');
    document.documentElement.setAttribute('theme', 'dark');
  },

  created() {
    this.$root.$on('sync.start', this.sync);
    document.addEventListener('isUpdateAvailable', (available) => {
      if (available) {
        const msg = 'New version available. Refresh to install';
        log.info(msg);
        this.$buefy.snackbar.open(msg);
      }
    });

    this.start();
  },

  destroyed() {
    this.$root.$off('sync.start', this.sync);
    while (listeners.length) {
      const listener = listeners.pop();
      listener.remove();
    }
  },

  methods: {
    onConnect(connected) {
      if (connected) {
        /** @type {string} */
        const path = this.$route.params.pathMatch;
        if (path === undefined) {
          this.$router.push('/l/');
        }
        RemoteProvider.peek().then(metadatas => {
          const msg = metadatas.length > 0 ? 'Remote updates pending' : 'Up to date';
          log.info(msg);
          this.$buefy.snackbar.open(msg);
        });
      } else {
        const msg = 'Not connected';
        log.info(msg);
        this.$buefy.snackbar.open({
          message: msg,
          type: 'is-warning'
        });
      }
    },

    updateProgress(event) {
      this.progress.value = event.value;
      console.log(event);
    },

    sync() {
      this.$buefy.snackbar.open('Sync started');
      this.progress.value = 0;
      this.progress.show = true;
      SyncEngine.on('progress', this.updateProgress);
      SyncEngine.execute().then(() => {
        this.$buefy.snackbar.open('Sync complete');
        SyncEngine.off('progress');
        this.progress.show = false;
        this.progress.value = 0;
      });
    },

    start() {
      RemoteProvider.start(window).then(this.onConnect);
    },
  }
};
</script>

<style lang="scss">
@import './assets/css/app.scss'
</style>

<style scoped>
#progress {
  position: fixed;
  left: 1%;
  right: 1%;
  bottom: 1%;
  width: 98%;
}
</style>