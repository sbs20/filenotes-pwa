<template>
  <div>
    <textarea id="log" v-model="text" readonly></textarea>
    <md-button class="md-raised" @click="clearCursor">Clear cursor</md-button>
    <md-button class="md-raised" @click="clearLocalDeltas">Clear local actions</md-button>
    <md-button class="md-raised" @click="clearLocalFs">Clear local filesystem</md-button>
    <md-button class="md-raised" @click="clearLog">Clear log</md-button>
    <md-button class="md-raised" @click="clearAccessToken">Clear access token</md-button>
    <md-button class="md-raised md-accent" @click="nukeDatabase">Nuke database</md-button>
    <md-button class="md-raised" @click="causeRemoteError">Force remote error</md-button>
  </div>
</template>

<script>
import { StorageService } from '../classes/service';
//import EventBus from '../classes/event-bus';
import RemoteProvider from '../classes/remote-provider';
import Log from '../classes/log';

//let listener = null;
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

    clearAccessToken() {
      StorageService.settings.delete('accessToken').then(() => {
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
  font-size: 0.75em;
  line-height: 1em;
  padding: 0.5em;
  width: 100%;
  height: 24em;
}

</style>
