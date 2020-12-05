<template>
  <div>
    <navigation :menu="false">
      <template v-slot:header>
        {{ current.name }}
      </template>
      <template v-slot:end>
        <b-navbar-item v-if="!autoSave" @click="save"><b-icon icon="content-save"></b-icon></b-navbar-item>
        <b-navbar-item @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <file-editor :type="type" v-model="buffer" @save="save"></file-editor>
  </div>
</template>

<script>
import Constants from '../classes/constants';
import FileMetadata from '../classes/files/file-metadata';
import FilePath from '../classes/files/file-path';
import LocalProvider from '../classes/local-provider';
import Logger from '../classes/logger';
import Settings from '../classes/settings';
import Navigation from './Navigation';
import FileEditor from './FileEditor';

const log = Logger.get('File');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'File',

  beforeRouteLeave(to, from, next) {
    // Catches back navigation
    this.beforeClose().then(close => {
      if (close) {
        next();
      } else {
        next(false);
      }
    });
  },

  components: {
    FileEditor,
    Navigation
  },

  data() {
    settings.autoSave.get().then(value => {
      this.autoSave = value;
    });
    settings.autoSync.get().then(value => {
      this.autoSync = value;
    });

    return {
      autoSave: true,
      autoSync: true,

      /** @type {Buffer} */
      buffer: null,

      /** @type {Metadata} */
      current: {},

      /** @type {FileType} */
      type: 'unknown',
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

    /**
     * @returns {Promise.<boolean>}
     */
    beforeClose() {
      return new Promise(resolve => {
        if (this.changed()) {
          if (this.autoSave) {
            this.save();
            resolve(true);
          } else {
            // TODO Prompt
            resolve(false);
          }
        } else {
          resolve(true);
        }
      });
    },

    changed() {
      const metadata = FileMetadata.create().assign(this.current).data(this.buffer).value;
      return this.current.hash !== metadata.hash;
    },

    close() {
      this.$router.go(-1);
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      this.type = 'unknown';
      fs.get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        this.current = current;
        fs.read(current.key).then(buffer => {
          this.type = FilePath.create(current.path).type;
          this.buffer = Buffer.from(buffer);
        });
      });
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    save() {
      const metadata = FileMetadata.create().assign(this.current).data(this.buffer).value;
      fs.write(metadata, this.buffer).then((saved) => {
        if (saved) {
          this.notify(`Saved ${metadata.name}`);
          //log.debug('Saved', this.value);
          //this.$emit('value', metadata);
          this.sync();
        }
      });
    },

    sync() {
      if (this.autoSync) {
        this.$root.$emit(Constants.Event.Sync.Start);
      }
    }
  }
};
</script>
