<template>
  <div>
    <textarea rows="10" cols="80" v-model="text" readonly></textarea>
    <input value="Clear cursor" @click="clearCursor">
    <input value="Clear local actions" @click="clearLocalActions">
    <input value="Clear local filesystem" @click="clearLocalFs">
    <input value="Clear access token" @click="clearAccessToken">
  </div>
</template>

<script>
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
    },

    clearAccessToken() {
    }
  }
}
</script>

<style scoped>
</style>
