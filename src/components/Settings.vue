<template>
  <div>
    <navigation>
      <template v-slot:header>Settings</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div class="title is-4">Local files</div>
    <div>
      Clear local filesystem
      <button class="button is-primary" @click="clearLocalFs">Clear</button>
    </div>

    <div>      
      <button class="button" @click="clearCursor">Clear cursor</button>
      <button class="button" @click="clearLocalDeltas">Clear local actions</button>
      <button class="button" @click="clearLocalFs">Clear local filesystem</button>
      <button class="button" @click="clearOAuthToken">Clear access token</button>
      <button class="button" @click="nukeDatabase">Nuke database</button>
      <button class="button" @click="connect1">Connect from storage</button>
      <button class="button" @click="connect2">Connect from code</button>
      <button class="button" @click="connect3">Force auth</button>
    </div>
  </div>
</template>

<script>
import Logger from '../classes/logger';
import { RemoteProvider, StorageService } from '../services';
import Navigation from './Navigation';

const log = Logger.get('Settings');

export default {
  name: 'Settings',
  components: {
    Navigation
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 27) {
        this.close();
      }
    },

    close() {
      this.$router.push('/l/');
    },

    clearCursor() {
      StorageService.settings.delete('cursor').then(() => {
        log.info('Cursor cleared');
      });
    },

    clearLocalDeltas() {
      StorageService.fs.delta.clear().then(() => {
        log.info('Local deltas cleared');
      });
    },

    clearLocalFs() {
      Promise.all([
        StorageService.fs.metadata.clear(),
        StorageService.fs.content.clear(),
        StorageService.fs.delta.clear()
      ]).then(() => {
        log.info('Local database cleared');
      });
    },

    clearLog() {
      // TODO
    },

    clearOAuthToken() {
      StorageService.settings.delete('oauth').then(() => {
        log.info('Access token cleared');
      });
    },

    nukeDatabase() {
      StorageService.deleteDatatabase().then(() => {
        log.info('Local database deleted');
      });
    },

    causeRemoteError() {
      RemoteProvider.read('/non-existent-file');
    },

    connect1() {
      RemoteProvider.startFromToken().then(this.afterConnect);
    },

    connect2() {
      RemoteProvider.startFromQueryString(window.location.search).then(this.afterConnect);
    },

    connect3() {
      RemoteProvider.startAuthentication(window);
    }
  }
};
</script>
