<template>
  <div id="app">
    <h1>Filenotes</h1>
    <div style="float: left; width: 60%">
      <router-view></router-view>
    </div>
    <div v-if="true" style="float: left; width: 38%">
      <Console></Console>
    </div>
  </div>
</template>

<script>
import Console from './components/Console.vue';
import { connect } from './classes/remote-provider';

export default {
  name: 'App',
  components: {
    Console,
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

<style>
</style>
