<template>
  <div class="container">
    <navigation>
      <template v-slot:header>Console</template>
      <template v-slot:end>
        <b-navbar-item tag="router-link" :to="{ path: '/l/' }"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div>
      <textarea id="log" v-model="text" readonly></textarea>
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
  </div>
</template>

<script>
import EventBus from '../classes/event-bus';
import { StorageService } from '../classes/service';
import Navigation from './Navigation';
import RemoteProvider from '../classes/remote-provider';
import Log from '../classes/log';
import {
  connectUsingStoredToken,
  connectUsingUrlCode,
  forceAuthentication } from '../classes/remote-provider';

const log = Log.get('Console');

/** @type {Array.<function(Event):void>} */
let listeners = [];

export default {
  name: 'Console',
  components: {
    Navigation
  },

  created() {
    listeners.push(EventBus.on('console', (e) => {
      this.messages.push(e.data);
    }));
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
      messages: [...log.messages]
    };
  },

  destroyed() {
    while (listeners.length) {
      const listener = listeners.pop();
      listener.remove();
    }
  },

  methods: {
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
      connectUsingStoredToken().then(this.afterConnect);
    },

    connect2() {
      connectUsingUrlCode(window.location.search).then(this.afterConnect);
    },

    connect3() {
      forceAuthentication(window);
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

</style>
