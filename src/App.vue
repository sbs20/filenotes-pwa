<template>
  <div>
    <div class="container">
      <install></install>
      <div id="progress">
        <b-progress v-if="progress.show" type="is-primary" size="is-small" :value="progress.value" :show-value="false"></b-progress>
        <b-progress v-if="progress.status" :type="progress.status" size="is-small" :value="100" :show-value="false"></b-progress>
      </div>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>

<script>
import Constants from './classes/constants';
import Logger from './classes/logger';
import SyncEngine from './classes/sync-engine';
import RemoteProvider from './classes/remote-provider';
import Settings from './classes/settings';

import Install from './components/Install';

const log = Logger.get('App');
const settings = Settings.instance();
const sync = SyncEngine.instance();

export default {
  name: 'App',

  components: {
    Install
  },

  data() {
    return {
      progress: {
        status: '',
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
    this.$root.$on(Constants.Event.Sync.Start, this.syncStart);
    this.$root.$on(Constants.Event.Sync.Listen, this.syncListen);
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
    this.$root.$off(Constants.Event.Sync.Start, this.syncStart);
    this.$root.$off(Constants.Event.Sync.Listen, this.syncListen);
  },

  methods: {
    onConnect(connected) {
      if (connected) {
        /** @type {string} */
        if (this.$route.matched.length === 0) {
          this.$router.replace('/list');
        }

        settings.autoSync.get().then(enabled => {
          if (enabled) {
            this.syncStart();
          } else {
            sync.isRequired().then(required => {
              const msg = required ? 'Sync required' : 'Up to date';
              log.info(msg);
              this.$buefy.snackbar.open(msg);
            });
          }
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
    },

    syncFinish(success) {
      this.progress.show = false;
      this.progress.value = 0;
      this.$root.$emit(Constants.Event.Sync.Finish);
      this.progress.status = success ? 'is-success' : 'is-danger';
      setTimeout(() => this.progress.status = '', 2000);

      settings.autoSync.get().then(enabled => {
        if (enabled) {
          this.$root.$emit(Constants.Event.Sync.Listen);
        }
      });
    },

    syncListen() {
      log.debug('Listening for updates');
      RemoteProvider.instance().poll().then(changes => {
        if (changes) {
          if (sync.active) {
            log.debug('Already syncing. Ignore change');
            return;
          }

          settings.autoSync.get().then(enabled => {
            if (enabled) {
              this.syncStart();
            }
          });

        } else {
          log.debug('Poll finished with no changes');
          settings.autoSync.get().then(enabled => {
            if (enabled) {
              this.$root.$emit(Constants.Event.Sync.Listen);
            }
          });
        }
      }).catch(reason => {
        log.debug(`syncListen: ${reason}`);
      });
    },

    syncStart() {
      this.progress.value = 0;
      this.progress.status = '';
      this.progress.show = true;
      sync.on('progress', this.updateProgress);
      sync.execute().then(() => {
        sync.off('progress');
        this.syncFinish(true);
      }).catch(reason => {
        sync.off('progress');
        const msg = `Sync error: ${reason}`;
        log.error(msg);
        this.syncFinish(false);
      });
    },

    start() {
      RemoteProvider.instance().start(window).then(connected => {
        if (connected) {
          this.onConnect(connected);
        } else {
          this.$router.replace('/start');
        }
      });
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