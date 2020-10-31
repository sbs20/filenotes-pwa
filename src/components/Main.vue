<template>
  <div>
    <h1>Filenotes</h1>
    <input type="button" value="Sync" @click="go">
    <List></List>
    <DevConsole></DevConsole>
  </div>
</template>

<script>
import DevConsole from './DevConsole.vue'
import List from './List.vue'
import { connect } from '../js/remote-provider';
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

  mounted() {
    connect(window);
  },

  methods: {
    async go() {
      await Sync.execute();
    },
  }
}
</script>

<style scoped>
</style>
