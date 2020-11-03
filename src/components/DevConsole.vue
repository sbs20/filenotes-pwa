<template>
  <div>
    <textarea rows="10" cols="80" v-model="text" readonly></textarea>
    <input type="button" value="Clear cursor" @click="clearCursor">
    <input type="button" value="Clear local actions" @click="clearLocalActions">
    <input type="button" value="Clear local filesystem" @click="clearLocalFs">
    <input type="button" value="Clear access token" @click="clearAccessToken">
    <input type="button" value="Nuke database" @click="nukeDatabase">
    <input type="button" value="Remote error" @click="causeRemoteError">
  </div>
</template>

<script>
import { StorageService } from '../classes/service';
import EventBus from '../classes/event-bus';
import RemoteProvider from '../classes/remote-provider';
import Log from '../classes/log';

let listener = null;
const log = Log.get('DevConsole');

export default {
  name: 'DevConsole',

  created() {
    listener = EventBus.on('console', e => {
      this.messages.push(e.data);
    });
  },

  destroyed() {
    if (listener) {
      listener.remove();
    }
  },

  data() {
    return {
      messages: []
    };
  },

  computed: {
    text() {
      return this.messages.join('\n');
    }
  },

  methods: {
    clearCursor() {
      StorageService.settings.delete('remoteCursor').then(() => {
        log.info('Local cursor cleared');
      });
    },

    clearLocalActions() {
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
</style>
