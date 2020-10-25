<template>
  <div>
    <textarea rows="10" cols="80" v-model="text" readonly></textarea>
  </div>
</template>

<script>
import EventBus from '../js/event-bus';
let listener = null;

export default {
  name: 'Console',

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
  }
}
</script>

<style scoped>
</style>
