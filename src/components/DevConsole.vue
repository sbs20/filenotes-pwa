<template>
  <div>
    <textarea rows="10" cols="80" v-model="text" readonly></textarea>
    <input type="button" value="Clear cursor" @click="clearCursor">
    <input type="button" value="Clear local actions" @click="clearLocalActions">
    <input type="button" value="Clear local filesystem" @click="clearLocalFs">
    <input type="button" value="Clear access token" @click="clearAccessToken">
  </div>
</template>

<script>
import Context from '../js/context';
import EventBus from '../js/event-bus';
let listener = null;

export default {
  name: 'DevConsole',

  created() {
    listener = EventBus.on('console', e => {
      this.messages.push(e);
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
      return this.messages.map(o => JSON.stringify(o)).join('\n');
    }
  },

  methods: {
    clearCursor() {
    },

    clearLocalActions() {
    },

    clearLocalFs() {
      Context.storage.fs.metadata.clear();
      Context.storage.fs.content.clear();
    },

    clearAccessToken() {
    }
  }
}
</script>

<style scoped>
</style>
