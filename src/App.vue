<template>
  <v-app>
    <transition name="fade">
      <div v-if="progress.show && foregroundSync" class="mask"></div>
    </transition>

    <navigation-drawer v-on:sync-force="syncForce"></navigation-drawer>

    <div id="progress">
      <v-progress-linear v-if="progress.show" v-model="progress.value"></v-progress-linear>
      <v-progress-linear v-if="progress.status" :color="progress.status" :value="100"></v-progress-linear>
    </div>

    <v-main>
      <install></install>
      <v-container fluid>
        <transition name="fade" mode="out-in" :duration="150">
          <router-view></router-view>
        </transition>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.text }}
      <v-btn :color="snackbar.color" text @click="snackbar.show = false">Ok</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import Constants from './classes/constants';
import Context from './classes/context';
import Logger from './classes/logger';
import Settings from './classes/settings';

import Install from './components/Install';
import NavigationDrawer from './components/NavigationDrawer';

const log = Logger.get('App');
const settings = Settings.instance();
const context = Context.instance();

export default {
  name: 'App',

  components: {
    Install,
    NavigationDrawer
  },

  data() {
    return {
      foregroundSync: true,
      progress: {
        status: '',
        show: false,
        value: 0
      },
      snackbar: {
        color: 'green',
        show: false,
        text: '',
        timeout: 2000
      }
    };
  },

  mounted() {
    document.body.classList.add('app-background');
  },

  created() {
    this.$root.$on(Constants.Event.App.Reload, this.start);
    this.$root.$on(Constants.Event.Snackbar, this.openSnackbar);
    this.$root.$on(Constants.Event.Sync.Start, this.syncStart);
    this.$root.$on(Constants.Event.Sync.Listen, this.syncListen);
    document.addEventListener('isUpdateAvailable', (available) => {
      if (available) {
        const msg = 'New version available. Refresh to install';
        log.info(msg);
        this.openSnackbar(msg);
      }
    });

    this.start();
  },

  destroyed() {
    this.$root.$off(Constants.Event.App.Reload, this.start);
    this.$root.$off(Constants.Event.Snackbar, this.openSnackbar);
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
            context.sync.isRequired().then(required => {
              const msg = required ? 'Sync required' : 'Up to date';
              log.info(msg);
              this.openSnackbar(msg);
            });
          }
        });
      } else {
        const msg = 'Not connected';
        log.info(msg);
        this.openSnackbar({
          text: msg,
          color: 'amber'
        });
      }
    },

    openSnackbar(event) {
      if (typeof(event) === 'string') {
        event = { text: event };
      }
      Object.assign(this.snackbar, event);
      this.snackbar.show = true;
    },

    updateProgress(event) {
      this.progress.value = event.value;
    },

    syncFinish(success) {
      this.progress.show = false;
      this.progress.value = 0;
      this.$root.$emit(Constants.Event.Sync.Finish);
      this.progress.status = success ? 'green' : 'red';
      setTimeout(() => this.progress.status = '', 2000);

      settings.autoSync.get().then(enabled => {
        if (enabled) {
          this.$root.$emit(Constants.Event.Sync.Listen);
        }
      });
    },

    syncListen() {
      if (!context.remote) {
        log.debug('Remote provider not configured');
        return;
      }

      log.debug('Listening for updates');
      context.remote.poll().then(changes => {
        if (changes) {
          if (context.sync.active) {
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

    syncForce() {
      settings.cursor.delete().then(() => {
        this.syncStart();
      });
    },

    syncStart() {
      this.progress.value = 0;
      this.progress.status = '';
      this.progress.show = true;
      const sync = context.sync;
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
      settings.theme.get().then(theme => {
        this.$vuetify.theme.dark = theme === Constants.Themes.Dark;
      });

      settings.foregroundSync.get().then(enabled => {
        this.foregroundSync = enabled;
      });

      context.init().then(() => {
        if (context.remote) {
          context.remote.start(window).then(connected => {
            if (connected) {
              this.onConnect(connected);
            } else {
              this.$router.replace('/start');
            }
          });
        } else {
          /** @type {string} */
          if (this.$route.matched.length === 0) {
            this.$router.replace('/list');
          }
        }
      });
    },
  }
};
</script>

<style scoped>
#progress {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 5;
}

.mask {
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,.4);
  top: 0;
  left: 0;
  z-index: 10;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
