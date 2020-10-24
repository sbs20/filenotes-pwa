<template>
  <div>
    <div v-for="file in files" v-bind:key="file.key">
      <div>{{ file.key }}</div>
      <div>{{ file.size }}</div>
      <div>{{ file.modified }}</div>
    </div>
  </div>
</template>

<script>
import LocalProvider from '../js/local-provider';

export default {
  name: 'List',

  data() {
    this.refresh();
    return {
      files: []
    };
  },

  methods: {
    refresh() {
      const local = new LocalProvider();
      local.list().then(files => {
        this.files = files;
      });
    }
  }
}
</script>

<style scoped>
</style>
