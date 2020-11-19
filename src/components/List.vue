<template>
  <div class="container">
    <navigation>
      <template v-slot:header>{{ header }}</template>
      <template v-slot:end>
        <b-navbar-item @click="sync"><b-icon icon="sync"></b-icon></b-navbar-item>
        <b-navbar-item @click="mkdir"><b-icon icon="folder-plus"></b-icon></b-navbar-item>
        <b-navbar-item @click="createText"><b-icon icon="file-plus"></b-icon></b-navbar-item>
        <b-navbar-item><b-icon icon="microphone"></b-icon></b-navbar-item>
        <b-navbar-item><b-icon icon="image-plus"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <b-modal :active.sync="moveDialog.show" has-modal-card trap-focus
      :destroy-on-hide="true" aria-role="dialog" aria-modal>
      <div class="modal-card" style="min-width: 400px; height: 600px;">
        <header class="modal-card-head">Move</header>
        <section class="modal-card-body">
          <folders v-model="moveDialog.folder"></folders>
        </section>
        <footer class="modal-card-foot">
          <button class="button" type="button" @click="moveDialog.show = false">Cancel</button>
          <button class="button is-primary" @click="move()">Move</button>
        </footer>
      </div>
    </b-modal>

    <div class="file-entry" v-for="entry in entries" v-bind:key="entry.key">
      <list-entry :value="entry" @open="open" @rename="rename" @remove="remove" @move="move"></list-entry>
    </div>

  </div>
</template>

<script>
import EventBus from '../classes/event-bus';
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import FolderMetadata from '../classes/files/folder-metadata';
import LocalProvider from '../classes/local-provider';
import Log from '../classes/log';

import Folders from './Folders';
import ListEntry from './ListEntry';
import Navigation from './Navigation';

const log = Log.get('List');

export default {
  name: 'List',
  components: {
    Folders,
    ListEntry,
    Navigation
  },

  computed: {
    header() {
      if (this.current && this.current.path) {
        /** @type {string} */
        const path = this.current.path;
        return path.slice(path.length - 30);
      } else {
        return '/';
      }
    }
  },

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],

      moveDialog: {
        show: false,
        entry: null,
        folder: null,
        callback: () => {}
      }
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

    createText() {
      if (this.current.tag === 'folder') {
        LocalProvider.new(this.current, 'New Text.txt').then(name => {
          if (name) {
            const path = `${this.current.path}/${name}`;
            const content = new Uint8Array();
            FileMetadata.create(path, content).then(metadata => {
              LocalProvider.write(metadata, content).then(() => {
                this.refresh();
              });
            });
          }
        });
      }
    },

    mkdir() {
      if (this.current.tag === 'folder') {
        this.$buefy.dialog.prompt({
          message: 'Directory name',
          inputAttrs: {
            type: 'text'
          },
          trapFocus: true,
          onConfirm: (value) => {
            const dir = `${this.current.path}/${value}`;
            LocalProvider.get(dir).then(existing => {
              if (existing !== undefined) {
                console.log(`Directory '${dir}' already exists`);
              } else {
                LocalProvider.mkdir(dir).then(() => {
                  this.refresh();
                });
              }
            });
          }
        });
      }
    },

    /**
     * @param {Metadata} entry
     */
    open(entry) {
      const base = entry.tag === 'folder' ? '/l/' : '/f/';
      this.$router.push(`${base}${entry.key}`);
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
    move(entry) {
      if (entry) {
        this.moveDialog.show = true;
        this.moveDialog.entry = entry;
        this.moveDialog.folder = FilePath.create(entry.path).directory;
      } else if (this.moveDialog.folder !== null) {
        const sourceDir = FilePath.create(this.moveDialog.entry.path).directory;
        const destinationDir = this.moveDialog.folder;
        if (sourceDir.toLowerCase() !== destinationDir.toLowerCase()) {
          const source = this.moveDialog.entry.key;
          const destination = `${this.moveDialog.folder}/${this.moveDialog.entry.name}`;
          LocalProvider.get(destination).then(existing => {
            if (existing !== undefined) {
              console.log(`Destination '${destination}' already exists`);
            } else {
              console.log(`move ${source} to ${destination}`);
              LocalProvider.move(source, destination).then(() => {
                this.refresh();
              });
            }
          });
        } else {
          log.info('Source and destination are the same. No action');
        }
        this.moveDialog = {
          show: false,
          entry: null,
          folder: null
        };
      }
    },

    /**
     * @param {Metadata} entry
     */
    rename(entry) {
      this.$buefy.dialog.prompt({
        message: 'Filename',
        inputAttrs: {
          type: 'text',
          value: entry.name,
        },
        trapFocus: true,
        onConfirm: (value) => {
          const source = entry.key;
          const destination = `${this.current.path}/${value}`;
          LocalProvider.get(destination).then(existing => {
            if (existing !== undefined) {
              console.log(`Destination '${destination}' already exists`);
            } else {
              LocalProvider.move(source, destination).then(() => {
                this.refresh();
              });
            }
          });
        }
      });
    },

    sync() {
      EventBus.emit('sync.request');
    }
  }
};
</script>

<style scoped>
.flash {
  width: 0.25rem;
  height: 3rem;
  float: left;
  margin-right: 0.75em;
}
.file-entry {
  height: 3.5rem;
  cursor: pointer;
}
</style>
