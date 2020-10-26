<template>
  <div>
    <div v-for="file in files" v-bind:key="file.key">
      <div>{{ file.tag }}</div>
      <div>{{ file.key }}</div>
      <div>{{ file.size }}</div>
      <div>{{ file.modified }}</div>
    </div>
    <input type="button" value="refresh list" @click="refresh">
  </div>
</template>

<script>
import Context from '../js/context';

export default {
  name: 'List',

  data() {
    this.refresh();
    return {
      cwd: '/',
      files: []
    };
  },

  methods: {
    refresh() {
      Context.local.list().then(files => {
        this.files = files.filter(metadata => {
          const key = metadata.key;
          return key.startsWith(this.cwd) && key.indexOf('/', this.cwd.length) === -1;
        }) ;
      });
    }
  }
}
</script>

<style scoped>
</style>
