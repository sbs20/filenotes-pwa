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
          <router-link v-if="entry.tag === 'folder'" :to="'/l/' + entry.key">{{ entry.name }}</router-link>
          <router-link v-if="entry.tag === 'file'" :to="'/f/' + entry.key">{{ entry.name }}</router-link>
          |
          {{ entry.size }} |
          {{ entry.modified }}
          <input type="button" value="x" @click="remove(entry)">
          <input type="button" value="r" @click="rename(entry)">
        </div>
      </div>
    </div>
    <input type="button" value="refresh list" @click="refresh">
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import FolderMetadata from '../classes/files/folder-metadata';
import LocalProvider from '../classes/local-provider';
import { SyncEngine } from '../classes/service';

export default {
  name: 'List',

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: []
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
          this.$router.push('/l/');
          return;
        }

        this.current = current || {
          tag: 'folder',
          key: '',
          path: '',
          name: '../ (parent)'
        };

        if (this.current.tag === 'file') {
          this.$router.push(`/f/${this.current.key}`);
        }

        LocalProvider.list(this.current).then(entries => {
          if (this.current.key !== '') {
            const parent = FolderMetadata.create(FilePath.create(this.current.path).directory);
            parent.name = '../ (parent)';
            entries.splice(0, 0, parent);
          }
          this.entries = entries;
        });
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
        if (dir) {
          LocalProvider.mkdir(`${this.current.path}/${dir}`).then(() => {
            this.refresh();
          });
        }
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
