<template>
  <div>
    <h1>Filenotes</h1>
    <input type="button" value="Init" @click="init">
    <div v-if="remote.connected">
      <input type="button" value="Sync" @click="go">
      <List></List>
    </div>
  </div>
</template>

<script>
import List from './List.vue'
import Remote from '../js/remote-service-manager';
import Sync from '../js/sync';

export default {
  name: 'Main',

  components: {
    List
  },

  data() {
    return {
      remote: Remote.service,
      local: null
    };
  },

  mounted() {
  },

  methods: {
    async init() {
      Remote.start(window);
    },

    async go() {
      await Sync.execute();
    },
  }
}
</script>

<style scoped>
</style>
