<template>
  <div id="app">
    <h1>Filenotes</h1>
    <div style="float: left; width: 60%">
      <router-view></router-view>
    </div>
    <div v-if="true" style="float: left; width: 38%">
      <console></console>
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
      connect(window).then(connected => {
        /** @type {string} */
        const path = this.$route.params.pathMatch;
        if (connected && path === undefined) {
          this.$router.push('/l/');
        }
      });
    }
  }
};
</script>

<style>
</style>
