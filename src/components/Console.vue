<template>
  <div>
    <textarea id="log" v-model="text" readonly></textarea>
    <button class="button" @click="clearCursor">Clear cursor</button>
    <button class="button" @click="clearLocalDeltas">Clear local actions</button>
    <button class="button" @click="clearLocalFs">Clear local filesystem</button>
    <button class="button" @click="clearLog">Clear log</button>
    <button class="button" @click="clearOAuthToken">Clear access token</button>
    <button class="button" @click="nukeDatabase">Nuke database</button>
    <button class="button" @click="causeRemoteError">Force remote error</button>
  </div>
</template>

<script>
import { StorageService } from '../classes/service';
import RemoteProvider from '../classes/remote-provider';
import Log from '../classes/log';

const log = Log.get('Console');

export default {
  name: 'Console',

  props: {
    logMessages: Array
  },

  computed: {
    text() {
      return this.logMessages.join('\n');
    }
  },

  methods: {
    clearCursor() {
      StorageService.settings.delete('remoteCursor').then(() => {
        log.info('Local cursor cleared');
      });
    },

    clearLocalDeltas() {
      StorageService.fs.delta.clear().then(() => {
        log.info('Local deltas cleared');
      });
    },

    clearLocalFs() {
      Promise.all(
        StorageService.fs.metadata.clear(),
        StorageService.fs.content.clear(),
        StorageService.fs.delta.clear()
      ).then(() => {
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
