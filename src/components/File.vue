<template>
  <div>
    <navigation>
      <template v-slot:header>
        {{ current.name }}
      </template>
      <template v-slot:end>
        <b-navbar-item @click="save"><b-icon icon="content-save"></b-icon></b-navbar-item>
        <b-navbar-item @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <file-item ref="fileItem" v-model="current"></file-item>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import { LocalProvider } from '../services';

import Navigation from './Navigation';
import FileItem from './FileItem';

export default {
  name: 'File',
  components: {
    FileItem,
    Navigation
  },

  data() {
    return {
      /** @type {Metadata} */
      current: {},
    };
  },

  created() {
    this.load();
    document.addEventListener('keydown', this._onKeys);
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
  },

  watch: {
    $route() {
      this.load();
    }
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 27) {
        this.close();
      }
    },

    close() {
      const parent = FilePath.create(this.current.key).directory;
      this.$router.push(`/l/${parent}`);
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      this.type = 'unknown';
      LocalProvider.get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        this.current = current;
      });
    },

    save() {
      this.$refs.fileItem.save();
    },
  }
};
</script>

<style scoped>
</style>
