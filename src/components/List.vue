<template>
  <div>
    <input type="button" value="Sync" @click="sync">
    <div v-for="entry in entries" v-bind:key="entry.key">
      <div>
        {{ entry.tag }} |
        <router-link :to="'/f/' + entry.key">{{ entry.name }}</router-link> |
        {{ entry.size }} |
        {{ entry.modified }}
        <input type="button" value="x" @click="remove(entry)">
      </div>
    </div>
    <div v-if="data">
      <input type="button" value="back" @click="$router.go(-1)">
      <input type="button" value="save" @click="save">
      <textarea v-model="data"></textarea>
    </div>
    <input type="button" value="refresh list" @click="refresh">
  </div>
</template>

<script>
import Convert from '../classes/utils/convert';
import FilePath from '../classes/files/file-path';
import FolderMetadata from '../classes/files/folder-metadata';
import LocalProvider from '../classes/local-provider';
import Log from '../classes/log';
import { Hasher, SyncEngine } from '../classes/service';

const log = Log.get('List');

export default {
  name: 'List',

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],

      data: null
    };
  },

  watch: {
    $route() {
      this.refresh();
    }
  },

  methods: {
    refresh() {
      LocalProvider.get(this.$route.params.pathMatch).then(current => {
        this.entries = [];
        this.data = null;
        this.current = current || {
          tag: 'folder',
          key: '',
          path: '',
          name: '../ (parent)'
        };

        if (this.current.tag === 'folder') {
          LocalProvider.list(this.current).then(entries => {
            if (this.current.key !== '') {
              const parent = FolderMetadata.create(FilePath.create(this.current.path).directory);
              parent.name = '../ (parent)';
              entries.splice(0, 0, parent);
            }
            this.entries = entries;
          });
        } else if (this.current.tag === 'file') {
          LocalProvider.read(this.current.key).then(buffer => {
            console.log('Stored', this.current.hash);
            Hasher.hash(buffer).then(hash => {
              console.log('Calc', hash);
            });
            this.data = `{${this.current.name}}`;
            if (this.current.name.endsWith('.txt')) {
              this.data = Convert.arrayBufferToString(buffer);
            }
          });
        }
      });
    },
  
    /**
     * @param {Metadata} entry
     */
    remove(entry) {
      LocalProvider.delete(entry.path);
      this.refresh();
    },

    save() {
      const buffer = Convert.stringToArrayBuffer(this.data);
      LocalProvider.write(this.current.path, buffer);
      log.debug('Save', this.current);
    },

    sync() {
      SyncEngine.execute().then(() => {
        this.refresh();
      });
    }
  }
};
</script>

<style scoped>
</style>
