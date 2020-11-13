<template>
  <div class="md-layout" style="position: relative;">
    <md-dialog v-if="entry" :md-active="true">
      <md-dialog-title>Name</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>Enter a name</label>
          <md-input v-model="entry.name"></md-input>
        </md-field>
      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary" @click="entry = null">Cancel</md-button>
        <md-button class="md-primary" @click="rename()">Save</md-button>
      </md-dialog-actions>
    </md-dialog>

    <div class="md-layout-item">
      <md-speed-dial class="md-top-right" md-direction="bottom">
        <md-speed-dial-target class="md-primary" @click="createFile">
          <md-icon>text_snippet</md-icon>
        </md-speed-dial-target>

        <md-speed-dial-content>
          <md-button class="md-icon-button" @click="mkdir">
            <md-icon>create_new_folder</md-icon>
          </md-button>
        </md-speed-dial-content>
      </md-speed-dial>

      <div v-if="current">
        <h2>Location: {{ current.path || "/" }}</h2>
      </div>

      <md-list class="md-double-line">
        <div v-for="entry in entries" v-bind:key="entry.key">
          <md-list-item @click="open(entry)">
            <md-icon>{{ icon(entry) }}</md-icon>
            <div class="md-list-item-text">
              <span>{{ entry.name }}</span>
              <span>{{ description(entry) }}</span>
            </div>
            <md-menu md-size="medium" :md-offset-x="-82" :md-offset-y="-40" v-on:click.stop>
              <md-button class="md-icon-button" md-menu-trigger>
                <md-icon>more_vert</md-icon>
              </md-button>

              <md-menu-content>
                <md-menu-item @click="rename(entry)">
                  <span>Rename</span>
                  <md-icon>text_format</md-icon>
                </md-menu-item>

                <md-menu-item @click="remove(entry)">
                  <span>Delete</span>
                  <md-icon>delete</md-icon>
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </md-list-item>
        </div>
      </md-list>

    </div>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import FolderMetadata from '../classes/files/folder-metadata';
import LocalProvider from '../classes/local-provider';
import { DateTime } from 'luxon';

export default {
  name: 'List',
  components: {
  },

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],

      /** @type {Metadata} */
      entry: null,

      /** @type {boolean} */
      showRename: false
    };
  },

  watch: {
    $route() {
      this.refresh();
    }
  },

  methods: {

    /**
     * @param {Metadata} entry
     */
    size(entry) {
      const kb = 1 << 10;
      const mb = kb << 10;
      if (entry.size < 0) {
        return '0';
      } else if (entry.size === 1) {
        return '1 Byte';
      } else if (entry.size < kb << 1) {
        return `${entry.size} Bytes`;
      } else if (entry.size < mb << 1) {
        return `${Math.ceil(entry.size / kb)} KB`;
      } else {
        return `${Math.round(100.0 * entry.size / mb) / 100.0} MB`;
      }
    },

    /**
     * @param {Metadata} entry
     */
    modified(entry) {
      const dt = DateTime.fromISO(entry.modified);
      return dt.toLocaleString(DateTime.DATETIME_MED);
    },

    /**
     * @param {Metadata} entry
     */
    description(entry) {
      if (entry.tag === 'folder') {
        return '';
      }

      return `${this.size(entry)} (${this.modified(entry)})`; 
    },

    /**
     * @param {Metadata} entry
     */
    icon(entry) {
      if (entry.tag === 'folder') {
        return 'folder';
      }

      switch (FilePath.create(entry.path).type) {
        case 'audio':
          return 'mic';

        case 'text':
        default:
          return 'text_snippet';
      }
    },

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
        if (name) {
          const path = `${this.current.path}/${name}`;
          const content = new Uint8Array();
          FileMetadata.create(path, content).then(metadata => {
            LocalProvider.write(metadata, content).then(() => {
              this.refresh();
            });
          });
        }
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
    rename(entry) {
      if (entry) {
        this.entry = entry;
        this.showRename = true;
      } else if (this.showRename) {
        this.showRename = false;
        const source = this.entry.key;
        const destination = `${this.current.path}/${this.entry.name}`;
        this.entry = null;
        LocalProvider.move(source, destination).then(() => {
          this.refresh();
        });
      }
      // this.entryName = null;
      // const name = window.prompt('New name');
      // if (name) {
      //   const destination = `${this.current.path}/${name}`;
      //   LocalProvider.move(entry.key, destination).then(() => {
      //     this.refresh();
      //   });
      // }
    },
  }
};
</script>

<style scoped>
.md-list {
  width: 100%;
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  border: 1px solid rgba(#000, .12);
}
</style>
