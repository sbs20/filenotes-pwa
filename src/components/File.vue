<template>
  <div>
    <h2>{{ this.current.name }}</h2>
    <div v-if="data !== null">
      <input type="button" value="close" @click="close">
      <input type="button" value="save" @click="save">
      <textarea id="content" v-model="data"></textarea>
    </div>
  </div>
</template>

<script>
import Convert from '../classes/utils/convert';
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import LocalProvider from '../classes/local-provider';
import Log from '../classes/log';

const log = Log.get('List');

export default {
  name: 'File',

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: {},
      data: null
    };
  },

  watch: {
    $route() {
      this.refresh();
    }
  },

  methods: {
    close() {
      const parent = FilePath.create(this.current.path).directory;
      this.$router.push(`/l/${parent}`);
    },

    refresh() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      LocalProvider.get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        this.current = current;
        this.data = null;
        LocalProvider.read(this.current.key).then(buffer => {
          this.data = `{${this.current.name}}`;
          if (this.current.name.endsWith('.txt')) {
            this.data = Convert.arrayBufferToString(buffer);
          }
        });
      });
    },

    /**
     * @param {Metadata} entry
     */
    remove() {
      LocalProvider.delete(this.current.path).then(() => {
        this.close();
      });
    },

    /**
     * @param {Metadata} entry
     */
    rename(entry) {
      const name = window.prompt('New name');
      if (name) {
        const destination = `${this.current.path}/${name}`;
        LocalProvider.move(entry.key, destination).then(() => {
          this.refresh();
        });
      }
    },

    save() {
      const buffer = Convert.stringToArrayBuffer(this.data);
      FileMetadata.from(this.current, buffer).then(metadata => {
        LocalProvider.write(metadata, buffer).then(() => {
          log.debug('Saved', this.current);
        });
      });
    },
  }
};
</script>

<style scoped>
#content {
  width: 95%;
  height: 20em;
}
</style>
