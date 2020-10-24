<template>
  <div>
    <h1>Filenotes</h1>
    <input type="button" value="Init" @click="init">
    <div v-if="manager.remote.connected">
      <input type="button" value="Sync" @click="go">
      <List></List>
    </div>
  </div>
</template>

<script>
import List from './List.vue'
import Manager from '../js/manager';
import Sync from '../js/sync';

export default {
  name: 'Main',

  components: {
    List
  },

  data() {
    return {
      manager: Manager
    };
  },

  mounted() {
  },

  methods: {
    async init() {
      Manager.start(window);
    },

    async go() {
      await Sync.execute();
    },
  }
}
</script>

<style scoped>
</style>
