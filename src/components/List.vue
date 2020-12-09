<template>
  <div>
    <navigation>
      <template v-slot:header>
      </template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="syncForce">
          <b-icon class="mr-4" icon="sync"></b-icon>Force Sync
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/console' }">
          <b-icon class="mr-4" icon="console"></b-icon>Console
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/settings' }">
          <b-icon class="mr-4" icon="cog"></b-icon>Settings
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/about' }">
          <b-icon class="mr-4" icon="information"></b-icon>About
        </b-navbar-item>
      </template>
    </navigation>

    <div class="pr-4" style="float: right">
      <button class="button mr-2" @click="sync">
        <b-icon icon="sync"></b-icon>
      </button>

      <button class="button mr-2" @click="$router.push(`/search`)">
        <b-icon icon="magnify"></b-icon>
      </button>

      <sort-options v-model="sortBy"></sort-options>

      <b-dropdown aria-role="list" :mobile-modal="false" position="is-bottom-left">
        <button class="button is-primary" slot="trigger">
          <b-icon icon="plus"></b-icon>
        </button>

        <b-dropdown-item aria-role="listitem" @click="mkdir">
          <b-icon class="pr-4" icon="folder-plus"></b-icon>Directory
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="mktext">
          <b-icon class="pr-4" icon="file-plus"></b-icon>Text file
        </b-dropdown-item>
        <!-- <b-dropdown-item aria-role="listitem">
          <b-icon class="pr-4" icon="microphone-plus"></b-icon>Audio file
        </b-dropdown-item>
        <b-dropdown-item aria-role="listitem">
          <b-icon class="pr-4" icon="image-plus"></b-icon>Image file
        </b-dropdown-item> -->
      </b-dropdown>
    </div>
    <div class="pl-4 title is-4">
      {{ header }}
    </div>

    <div class="list-item" tabindex="1" v-for="entry in entries" v-bind:key="entry.key">
      <list-item :value="entry" @open="open" @rename="rename" @remove="remove" @move="move"></list-item>
    </div>

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

  </div>
</template>

<script>
import Constants from '../classes/constants';
import LocalProvider from '../classes/local-provider';
import FilePath from '../classes/files/file-path';
import FolderMetadata from '../classes/files/folder-metadata';
import Logger from '../classes/logger';
import MetadataComparator from '../classes/metadata-comparator';
import Settings from '../classes/settings';

import Folders from './Folders';
import ListItem from './ListItem';
import Navigation from './Navigation';
import SortOptions from './SortOptions';

const log = Logger.get('List');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'List',
  components: {
    Folders,
    ListItem,
    Navigation,
    SortOptions
  },

  computed: {
    header() {
      if (this.current && this.current.path) {
        /** @type {string} */
        const path = this.current.path;
        return path;//.slice(path.length - 40);
      } else {
        return '/';
      }
    }
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    this.$root.$on(Constants.Event.Sync.Finish, this.refresh);
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
    this.$root.$off(Constants.Event.Sync.Finish, this.refresh);
  },

  data() {
    settings.autoSync.get().then(value => {
      this.autoSync = value;
    });

    this.refresh();
    return {
      autoSync: true,

      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],

      moveDialog: {
        show: false,
        entry: null,
        folder: null,
        callback: () => {}
      },

      sortBy: null
    };
  },

  watch: {
    $route() {
      this.refresh();
    },
    sortBy() {
      settings.sortBy.set(this.sortBy).then(() => {
        this.refresh();
      });
    }
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 27) {
        this.up();
      }
    },

    refresh() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      fs.get(path).then(current => {
        if (current === undefined && path.length > 0) {
          this.$router.push('/list');
          return;
        }

        this.current = current || {
          tag: 'folder',
          key: '',
          path: '',
          name: Constants.ParentDirectory
        };

        if (this.current.tag === 'file') {
          this.$router.push(`/file${this.current.key}`);
        }

        fs.list(this.current).then(entries => {
          settings.sortBy.get().then(sortBy => {
            /** @type {function(Metadata, Metadata):number} */
            const sorter = MetadataComparator.get(sortBy);
            entries.sort(sorter);
            if (this.current.key !== '') {
              const parent = FolderMetadata.create(FilePath.create(this.current.path).directory);
              parent.name = '../ (parent)';
              entries.splice(0, 0, parent);
            }
            this.entries = entries;
          });
        });
      });
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
            fs.get(dir).then(existing => {
              if (existing !== undefined) {
                console.log(`Directory '${dir}' already exists`);
              } else {
                fs.mkdir(dir).then(() => {
                  this.syncAuto();
                  this.refresh();
                });
              }
            });
          }
        });
      }
    },

    mktext() {
      if (this.current.tag === 'folder') {
        this.open({
          tag: 'file',
          key: `${this.current.path}?type=text`
        });
      }
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
          fs.get(destination).then(existing => {
            if (existing !== undefined) {
              console.log(`Destination '${destination}' already exists`);
            } else {
              console.log(`move ${source} to ${destination}`);
              fs.move(source, destination).then(() => {
                this.syncAuto();
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
    open(entry) {
      if (entry.key !== this.$route.params.pathMatch) {
        const base = entry.tag === 'folder' ? '/list' : '/file';
        const path = `${base}${entry.key}`;
        this.$router.push(path);
      }
    },

    /**
     * @param {Metadata} entry
     */
    remove(entry) {
      fs.delete(entry.path).then(() => {
        this.syncAuto();
        this.refresh();
      });
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
          fs.get(destination).then(existing => {
            if (existing !== undefined) {
              console.log(`Destination '${destination}' already exists`);
            } else {
              fs.move(source, destination).then(() => {
                this.syncAuto();
                this.refresh();
              });
            }
          });
        }
      });
    },

    sync() {
      this.$root.$emit(Constants.Event.Sync.Start);
    },

    syncAuto() {
      if (this.autoSync) {
        this.sync();
      }
    },

    syncForce() {
      settings.cursor.delete().then(() => {
        this.sync();
      });
    },

    up() {
      const parent = FolderMetadata.create(FilePath.create(this.current.path).directory);
      this.open(parent);
    },
  }
};
</script>
