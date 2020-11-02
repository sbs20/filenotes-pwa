<template>
  <div>
    <h1>Filenotes</h1>
    <List></List>
    <DevConsole></DevConsole>
  </div>
</template>

<script>
import DevConsole from './DevConsole.vue'
import List from './List.vue'
import { connect } from '../classes/remote-provider';

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
}
</script>

<style scoped>
</style>
