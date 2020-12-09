<template>
  <div>
    <navigation :menu="false">
      <template v-slot:header>
        {{ metadata.name }}
      </template>
      <template v-slot:end>
        <b-navbar-item v-if="!autoSave" @click="perform('save')"><b-icon icon="content-save"></b-icon></b-navbar-item>
        <b-navbar-item @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <file-editor :type="type" v-model="buffer" @save="perform('save')"></file-editor>

    <b-modal :active.sync="dialog.close.show" has-modal-card trap-focus
      :destroy-on-hide="true" aria-role="dialog" aria-modal
      :on-cancel="() => onCloseDialog()">
      <div class="modal-card">
        <header class="modal-card-head">Save?</header>
        <section class="modal-card-body">
          {{ metadata.name }} has changed. Do you want to save before closing?
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="onCloseDialog()">Cancel</button>
          <button class="button is-danger" @click="onCloseDialog('discard')">No</button>
          <button class="button is-success" @click="onCloseDialog('save', 'sync', 'close')">Yes</button>
        </footer>
      </div>
    </b-modal>

    <b-modal :active.sync="dialog.save.show" has-modal-card trap-focus
      :destroy-on-hide="true" aria-role="dialog" aria-modal
      :on-cancel="() => onSaveDialog(false)">
      <div class="modal-card">
        <header class="modal-card-head">Save?</header>
        <section class="modal-card-body">
          <b-field>
            <b-input ref="filename" v-model="dialog.save.filename"></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="onSaveDialog(false)">Cancel</button>
          <button class="button is-success" @click="onSaveDialog(true)">Ok</button>
        </footer>
      </div>
    </b-modal>

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
    if (this.discard || this.isSaved()) {
      next();
    } else {
      next(false);
      if (this.autoSave) {
        this.perform('save', 'sync', 'close');
      } else {
        this.dialog.close.show = true;
      }
    }
  },

  components: {
    FileEditor,
    Navigation
  },

  data() {
    settings.autoName.get().then(value => {
      this.autoName = value;
    });
    settings.autoSave.get().then(value => {
      this.autoSave = value;
    });
    settings.autoSync.get().then(value => {
      this.autoSync = value;
    });

    return {
      autoName: true,
      autoSave: true,
      autoSync: true,
      discard: false,
      isNew: false,

      dialog: {
        close: {
          show: false
        },
        save: {
          show: false,
          filename: null
        }
      },

      /** @type {Array.<FileAction>} */
      actions: [],

      /** @type {Buffer} */
      buffer: null,

      /** @type {string} */
      savedHash: null,

      /** @type {string} */
      originalHash: null,

      /** @type {Metadata} */
      directory: null,

      /** @type {Metadata} */
      metadata: {},

      /** @type {FileType} */
      type: 'unknown',
    };
  },

  created() {
    this.load();
    document.addEventListener('keyup', this._onKeys);
  },

  destroyed() {
    document.removeEventListener('keyup', this._onKeys);
  },

  watch: {
    $route() {
      this.load();
    }
  },

  methods: {
    _onKeys(event) {
      if (this.dialog.save.show || this.dialog.close.show) {
        return;
      }

      if (event.keyCode === 27) {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      }
    },

    /**
     * @param {BufferLike} buffer 
     * @param {FileType} type
     */
    _defaultName(buffer, type) {
      let name = undefined;
      if (type === 'text') {
        if (!Buffer.isBuffer(buffer)) {
          buffer = Buffer.from(buffer);
        }
        let end = Math.min(28, buffer.length);
        const content = buffer.slice(0, end).toString();
        const indexEnd = content.indexOf('\n');
        end = indexEnd === -1 ? undefined : indexEnd;
        let line = content.substr(0, end);
        line = line.replace(/[^a-z0-9 ]/ig, '').trim();
        name = line.length ? line : undefined;
      }

      if (name === undefined) {
        name = 'New';
      }

      const extension = FilePath.defaultExtension(type);
      return `${name}.${extension}`;
    },
    
    isSaved() {
      const metadata = FileMetadata.create().assign(this.metadata).data(this.buffer).value;
      return this.savedHash === metadata.hash;
    },

    /**
     * @param {Array.<FileAction>} actions
     * @returns {Promise.<void>}
     */
    perform(...actions) {
      this.actions = actions;
      const perform = action => () => {
        switch (action) {
          case 'name':
            this.metadata.name = this.dialog.save.filename;
            return Promise.resolve();
          case 'discard':
            this.discard = true;
            this.close();
            return Promise.resolve();
          case 'close':
            this.close();
            return Promise.resolve();
          case 'save':
            return this.save();
          case 'sync':
            this.sync();
            return Promise.resolve();
          default:
            return Promise.reject(`Unknown action: ${action}`);
        }
      };

      let promise = Promise.resolve();
      for (const action of actions) {
        promise = promise.then(perform(action));
      }

      return promise.then(() => {
        this.actions = [];
      }).catch(reason => {
        log.debug(`Perform terminated: ${reason}`);
      });
    },

    /**
     * @param {Array.<FileAction>} actions
     */
    onCloseDialog(...actions) {
      this.dialog.close.show = false;
      this.perform(...actions);
    },

    /**
     * @param {boolean} ok
     */
    onSaveDialog(ok) {
      this.dialog.save.show = false;
      if (!ok) {
        this.dialog.save.filename = null;
        this.actions = [];
        return;
      }

      const actions = this.actions.length ? this.actions : ['save'];
      this.perform(...actions);
    },

    close() {
      this.$router.go(-1);
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      this.type = 'unknown';
      fs.get(path).then(metadata => {
        if (metadata === undefined) {
          this.perform('discard');
          return;
        }

        this.type = this.$route.query.type;
        if (metadata.tag === 'folder' && this.type) {
          this.isNew = true;
          this.directory = metadata;
          this.originalHash = '';
          this.savedHash = '';
          this.buffer = Buffer.alloc(0);
        } else {
          this.metadata = metadata;
          fs.read(metadata.key).then(buffer => {
            this.type = FilePath.create(metadata.path).type;
            this.originalHash = metadata.hash;
            this.savedHash = metadata.hash;
            this.buffer = Buffer.from(buffer);
          });
        }
      });
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    /**
     * @returns {Promise.<Metadata>}
     */
    createMetadata() {
      return new Promise((resolve, reject) => {
        if (this.isNew) {
          const defaultName = this._defaultName(this.buffer, this.type);
          if (!this.autoName && this.dialog.save.filename === null) {
            this.dialog.save.filename = defaultName;
            this.dialog.save.show = true;
            reject('Interrupt for dialog');
            return;
          }

          let name = this.dialog.save.filename || defaultName;
          fs.new(this.directory, name).then(name => {
            const metadata = FileMetadata.create()
              .path(`${this.directory.path}/${name}`)
              .data(this.buffer)
              .value;
            resolve(metadata);
          });
        } else {
          const metadata = FileMetadata.create().assign(this.metadata).data(this.buffer).value;
          resolve(metadata);
        }
      });
    },

    /**
     * @returns {Promise.<Metadata>}
     */
    saveMetadata(metadata) {
      return new Promise(resolve => {
        fs.write(metadata, this.buffer).then((saved) => {
          if (saved) {
            this.notify(`Saved ${metadata.name}`);
            this.metadata = metadata;
            this.savedHash = metadata.hash;
            this.isNew = false;
          }
          resolve();
        });
      });
    },

    /**
     * @returns {Promise.<void>}
     */
    save() {
      return this.createMetadata().then(metadata => {
        return this.saveMetadata(metadata);
      });
    },

    sync() {
      if (this.autoSync && this.savedHash !== this.originalHash) {
        this.$root.$emit(Constants.Event.Sync.Start);
      }
    }
  }
};
</script>
