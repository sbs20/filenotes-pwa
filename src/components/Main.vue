<template>
  <div class="hello">
    <h1>Filenotes</h1>
    <input type="button" value="Init" @click="init">
    <div v-if="remote.connected">
      <input type="button" value="Go" @click="go">
      <textarea v-model="json"></textarea>
    </div>
  </div>
</template>

<script>
import Remote from '../js/remote-service-manager';
import Storage from '../js/storage';

export default {
  name: 'Main',

  data() {
    return {
      remote: Remote.service,
      local: null,
      json: ''
    };
  },

  mounted() {
  },

  methods: {
    async init() {
      Remote.start(window);
    },

    async go() {
      const files = await Remote.service.list();
      console.log(files);
      this.json = JSON.stringify(files);
      await Storage.queueIn.create(files);
    },
  }
}
</script>

<style scoped>
</style>
