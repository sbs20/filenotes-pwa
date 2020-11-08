<template>
  <div>
    <h1>Filenotes</h1>
    <input type="button" value="connect" @click="start">
    <div style="float: left; width: 45%"><List></List></div>
    <div style="float: left; width: 45%"><DevConsole></DevConsole></div>
  </div>
</template>

<script>
import DevConsole from './DevConsole.vue';
import List from './List.vue';
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
    this.start();
  },

  methods: {
    start() {
      connect(window);
    }
  }
};
</script>

<style scoped>
</style>
