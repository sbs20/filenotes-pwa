<template>
  <div>
    <textarea rows="10" cols="80" v-model="text" readonly></textarea>
    <input type="button" value="Clear cursor" @click="clearCursor">
    <input type="button" value="Clear local actions" @click="clearLocalActions">
    <input type="button" value="Clear local filesystem" @click="clearLocalFs">
    <input type="button" value="Clear access token" @click="clearAccessToken">
    <input type="button" value="Nuke database" @click="nukeDatabase">
  </div>
</template>

<script>
import { StorageService } from '../js/service';
import EventBus from '../js/event-bus';
let listener = null;

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
    },

    clearLocalActions() {
    },

    clearLocalFs() {
      StorageService.fs.metadata.clear();
      StorageService.fs.content.clear();
      StorageService.fs.delta.clear();
    },

    clearAccessToken() {
    },

    nukeDatabase() {
      StorageService.deleteDatatabase();
    }
  }
}
</script>

<style scoped>
</style>
