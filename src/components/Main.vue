<template>
  <div>
    <h1>Filenotes</h1>
    <input type="button" value="Init" @click="init">
    <input type="button" value="Sync" @click="go">
    <List></List>
    <DevConsole></DevConsole>
  </div>
</template>

<script>
import DevConsole from './DevConsole.vue'
import List from './List.vue'
import Manager from '../js/manager';
import Sync from '../js/sync';

export default {
  name: 'Main',

  components: {
    DevConsole,
    List
  },

  data() {
    return {
    };
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
