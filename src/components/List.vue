<template>
  <div>
    <input type="button" value="Sync" @click="sync">
    <div v-if="entries.length > 0">
      <input type="button" value="mkdir" @click="mkdir">
      <input type="button" value="create file" @click="createFile">
      <div v-if="current">
        CWD: {{ current.path }}
      </div>
      <div v-for="entry in entries" v-bind:key="entry.key">
        <div>
          {{ entry.tag }} |
          <router-link :to="'/f/' + entry.key">{{ entry.name }}</router-link> |
          {{ entry.size }} |
          {{ entry.modified }}
          <input type="button" value="x" @click="remove(entry)">
        </div>
      </div>
    </div>

    <div v-if="data !== null">
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
import FileMetadata from '../classes/files/file-metadata';
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
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      LocalProvider.get(path).then(current => {
        if (current === undefined && path.length > 0) {
          this.$router.push('/f/');
          return;
        }

        this.current = current || {
          tag: 'folder',
          key: '',
          path: '',
          name: '../ (parent)'
        };

        this.entries = [];
        this.data = null;
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

    createFile() {
      if (this.current.tag === 'folder') {
        const name = window.prompt('File name');
        const path = `${this.current.path}/${name}`;
        const content = new Uint8Array();
        FileMetadata.create(path, content).then(metadata => {
          LocalProvider.write(metadata, content).then(() => {
            this.refresh();
          });
        });
      }
    },

    mkdir() {
      if (this.current.tag === 'folder') {
        const dir = window.prompt('Directory name');
        LocalProvider.mkdir(`${this.current.path}/${dir}`).then(() => {
          this.refresh();
        });
      }
    },

    /**
     * @param {Metadata} entry
     */
    remove(entry) {
      LocalProvider.delete(entry.path).then(() => {
        this.refresh();
      });
    },

    save() {
      const buffer = Convert.stringToArrayBuffer(this.data);
      FileMetadata.from(this.current, buffer).then(metadata => {
        LocalProvider.write(metadata, buffer).then(() => {
          log.debug('Saved', this.current);
        });
      });
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
