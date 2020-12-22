<template>
  <transition name="fade">
    <v-app v-show="show">
      <transition name="fade">
        <div v-if="progress.show && foregroundSync" class="mask"></div>
      </transition>

      <navigation :key="navigationKey" v-on:sync-force="syncForce"></navigation>

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
  </transition>
</template>

<script>
import Constants from './classes/constants';
import Context from './classes/context';
import Logger from './classes/logger';
import Poller from './classes/cloud/poller';
import Settings from './classes/settings';

import Install from './components/Install';
import Navigation from './components/Navigation';

const log = Logger.get('App');
const settings = Settings.instance();
const context = Context.instance();
const poller = new Poller(window, context, 500);

export default {
  name: 'App',

  components: {
    Install,
    Navigation
  },

  data() {
    return {
      foregroundSync: true,
      navigationKey: 0,
      progress: {
        status: '',
        show: false,
        value: 0
      },
      show: false,
      snackbar: {
        color: 'green',
        show: false,
        text: '',
        timeout: 2000
      }
    };
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
    afterConnect(connected) {
      if (connected) {
        // Get rid of any query strings now we've connected
        if (window.location.search) {
          window.location.href = '/';
          return;
        }

        // Update navigation pane
        this.refreshNavigationComponent();

        // Default route if connected
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

    refreshNavigationComponent() {
      this.navigationKey = Date.now();
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

    start() {
      this.refreshNavigationComponent();

      settings.theme.get().then(theme => {
        if (theme === Constants.Themes.System) {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? Constants.Themes.Dark
            : Constants.Themes.Light;
        }
        this.$vuetify.theme.dark = theme === Constants.Themes.Dark;
        this.show = true;
      });

      settings.foregroundSync.get().then(enabled => {
        this.foregroundSync = enabled;
      });

      context.init().then(() => {
        if (context.remote) {
          context.remote.start(window).then(connected => {
            if (connected) {
              this.afterConnect(connected);
            } else if (this.$route.path !== '/about') {
              this.$router.replace('/about');
            }
          });
        } else if (this.$route.matched.length === 0) {
          this.$router.replace('/list');
        }
      });
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
      settings.autoSync.get().then(enabled => {
        if (enabled && !poller.running) {
          poller.run().then(changes => {
            if (changes) {
              if (context.sync.active) {
                log.debug('sync active - ignoring poll');
                return;
              }

              settings.autoSync.get().then(enabled => {
                if (enabled) {
                  log.debug('Poll finished: syncing');
                  this.syncStart();
                  return;
                }
              });
            }

            window.setTimeout(this.syncListen, poller.readyIn());
          });
        }
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
      sync.on(Constants.Event.Sync.Progress, this.updateProgress);
      sync.execute().then(() => {
        sync.off(Constants.Event.Sync.Progress);
        this.syncFinish(true);
      }).catch(reason => {
        sync.off(Constants.Event.Sync.Progress);
        const msg = `Sync error: ${reason}`;
        log.error(msg);
        this.syncFinish(false);
      });
    },
  }
};
</script>

<style scoped>
/* body {
  overscroll-behavior-y: none;
} */

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
