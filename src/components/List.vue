<template>
  <div>
    <list-new @directory="mkdir" @text="mktext"></list-new>

    <div class="d-flex flex-row mb-4">
      <div class="text-h5" style="word-break: break-word;">{{ header }}</div>
      <div class="d-flex ml-auto">
        <v-btn v-if="!autoSync" icon @click="sync"><v-icon>mdi-sync</v-icon></v-btn>
        <sort-options v-model="sortBy"></sort-options>
      </div>
    </div>

    <div>
      <list-item
        v-for="entry in entries" v-bind:key="entry.key" :value="entry"
        @open="open" @rename="rename" @remove="remove" @move="move"></list-item>
    </div>

    <v-dialog v-model="moveDialog.show" max-width="400" scrollable>
      <v-card>
        <v-card-title class="headline">Move</v-card-title>
        <v-card-text style="height: 400px">
          <folders v-model="moveDialog.folder"></folders>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="moveDialog.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="move()">Move</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <prompt ref="prompt"></prompt>
  </div>
</template>

<script>
import Constants from '../classes/constants';
import LocalProvider from '../classes/local-provider';
import FilePath from '../classes/files/file-path';
import FileBuilder from '../classes/files/file-builder';
import Logger from '../classes/logger';
import MetadataComparator from '../classes/metadata-comparator';
import Settings from '../classes/settings';

import Folders from './Folders';
import ListItem from './ListItem';
import ListNew from './ListNew';
import Prompt from './Prompt';
import SortOptions from './SortOptions';

const log = Logger.get('List');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'List',
  components: {
    Folders,
    ListItem,
    ListNew,
    Prompt,
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
      if (event.keyCode === Constants.Keys.escape) {
        this.up();
      }
    },

    refresh() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      fs.get(path).then(current => {
        if (current === undefined) {
          this.$router.push('/list');
          return;
        }

        this.current = current;

        if (this.current.tag === 'file') {
          this.$router.push(`/file${this.current.key}`);
        }

        fs.list(this.current).then(entries => {
          settings.sortBy.get().then(sortBy => {
            /** @type {function(Metadata, Metadata):number} */
            const sorter = MetadataComparator.get(sortBy);
            entries.sort(sorter);
            if (this.current.key !== '') {
              const parent = FileBuilder.folder(FilePath.create(this.current.path).directory);
              parent.name = Constants.ParentDirectory;
              entries.splice(0, 0, parent);
            }
            this.entries = entries;
          });
        });
      });
    },

    mkdir() {
      if (this.current.tag === 'folder') {
        this.$refs.prompt.open({
          message: 'Directory name',
          onConfirm: (value) => {
            const dir = `${this.current.path}/${value}`;
            fs.get(dir).then(existing => {
              if (existing !== undefined) {
                log.debug(`Directory '${dir}' already exists`);
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
              log.debug(`Destination '${destination}' already exists`);
            } else {
              log.debug(`move ${source} to ${destination}`);
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
      this.$refs.prompt.open({
        message: 'Filename',
        value: entry.name,
        onConfirm: (value) => {
          const source = entry.key;
          const destination = `${this.current.path}/${value}`;
          fs.get(destination).then(existing => {
            if (existing !== undefined) {
              log.debug(`Destination '${destination}' already exists`);
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

    up() {
      const parent = FileBuilder.folder(FilePath.create(this.current.path).directory);
      this.open(parent);
    },
  }
};
</script>
