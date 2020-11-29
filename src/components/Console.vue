<template>
  <div>
    <navigation>
      <template v-slot:header>Console</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div>
      <button class="button" @click="clearCursor">Clear cursor</button>
      <button class="button" @click="clearLocalDeltas">Clear local actions</button>
      <button class="button" @click="clearLocalFs">Clear local filesystem</button>
      <button class="button" @click="clearLog">Clear log</button>
      <button class="button" @click="clearOAuthToken">Clear access token</button>
      <button class="button" @click="nukeDatabase">Nuke database</button>
      <button class="button" @click="causeRemoteError">Force remote error</button>
      <button class="button" @click="connect1">Connect from storage</button>
      <button class="button" @click="connect2">Connect from code</button>
      <button class="button" @click="connect3">Force auth</button>
    </div>

    <div>
      <pre id="log">{{ text }}</pre>
    </div>
  </div>
</template>

<script>
import Logger from '../classes/logger';
import { RemoteProvider, StorageService } from '../services';
import Navigation from './Navigation';

const log = Logger.get('Console');

export default {
  name: 'Console',
  components: {
    Navigation
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    Logger.subscriber = msg => this.messages.push(msg);
  },

  computed: {
    text() {
      let value = '';
      for (let index = this.messages.length - 1; index > -1; index--) {
        value += `${this.messages[index]}\n`;
      }
      return value;
    }
  },

  data() {
    return {
      messages: [...Logger.messages]
    };
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
    Logger.subscriber = undefined;
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

<style scoped>
#log {
  background-color: rgba(0, 0, 0, 0);
  resize: none;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  line-height: 1em;
  padding: 0.5em;
  width: 100%;
  height: 24em;
}
pre {
    white-space: pre-wrap;
}
</style>
