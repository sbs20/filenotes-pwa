<template>
  <div>
    <div class="container">
      <install></install>
      <div id="progress" v-if="progress.show">
        <b-progress type="is-primary" size="is-small" :value="progress.value" :show-value="false"></b-progress>
      </div>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import Logger from './classes/logger';
import { RemoteProvider, SyncEngine } from './services';
import Install from './components/Install';

const log = Logger.get('App');

export default {
  name: 'App',

  components: {
    Install
  },

  data() {
    return {
      autoSync: true,
      progress: {
        show: false,
        value: 0
      }
    };
  },

  mounted() {
    document.body.classList.add('app-background');
    document.body.classList.add('has-navbar-fixed-top');
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
  },

  methods: {
    onConnect(connected) {
      if (connected) {
        /** @type {string} */
        const path = this.$route.params.pathMatch;
        if (path === undefined) {
          this.$router.replace('/l/');
        }
        if (this.autoSync) {
          this.sync();
        } else {
          SyncEngine.isRequired().then(required => {
            const msg = required ? 'Sync required' : 'Up to date';
            log.info(msg);
            this.$buefy.snackbar.open(msg);
          });
        }
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
    },

    sync() {
      this.progress.value = 0;
      this.progress.show = true;
      SyncEngine.on('progress', this.updateProgress);
      SyncEngine.execute().then(() => {
        this.$buefy.snackbar.open('Up to date');
        SyncEngine.off('progress');
        this.progress.show = false;
        this.progress.value = 0;
        this.$root.$emit('sync.finish');
      }).catch(reason => {
        this.$buefy.snackbar.open({
          message: `Sync error: ${reason}`,
          type: 'is-danger'
        });

        SyncEngine.off('progress');
        this.progress.show = false;
        this.progress.value = 0;
        this.$root.$emit('sync.finish');
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
  left: 0;
  right: 0;
  top: 4rem;
  width: 100%;
  z-index: 50;
}
</style>
<style>
.progress {
  border-radius: 0;
}
.progress.is-small {
  height: 0.2rem;
}
</style>