<template>
  <div>
    <div class="d-flex flex-row mb-4">
      <div class="text-h5">{{ metadata.name || '*New file' }}</div>
      <div class="d-flex ml-auto">
        <v-btn v-if="!autoSave" @click="perform('save')" icon><v-icon>mdi-content-save</v-icon></v-btn>
        <v-btn @click="close" icon><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </div>

    <file-editor :type="type" v-model="buffer" @save="perform('save')"></file-editor>

    <confirm-yes-no-cancel ref="confirmYesNoCancel"></confirm-yes-no-cancel>

    <prompt ref="prompt"></prompt>
  </div>
</template>

<script>
import EventBus from '@/classes/event-bus';
import Constants from '@/classes/constants';
import FileBuilder from '@/classes/files/file-builder';
import FilePath from '@/classes/files/file-path';
import LocalProvider from '@/classes/local-provider';
import Logger from '@/classes/logger';
import Settings from '@/classes/settings';
import Application from '@/classes/application';

import ConfirmYesNoCancel from './ConfirmYesNoCancel';
import FileEditor from './FileEditor';
import Prompt from './Prompt';

const log = Logger.get('File');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'File',

  beforeRouteLeave(to, from, next) {
    if (this.discard || this.isSaved()) {
      this.perform('sync');
      next();
    } else {
      next(false);
      if (this.autoSave) {
        this.perform('save', 'sync', 'close');
      } else {
        this.$refs.confirmYesNoCancel.open({
          message: 'Do you want to save before closing?',
          onYes: () => this.perform('save', 'sync', 'close'),
          onNo: () => this.perform('discard')
        });
      }
    }
  },

  components: {
    ConfirmYesNoCancel,
    FileEditor,
    Prompt
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
      filename: null,

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
      if (event.keyCode === Constants.Keys.escape && !Application.isDialogActive) {
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
      const metadata = FileBuilder.data(this.metadata, this.buffer);
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
      EventBus.instance().emit(Constants.Event.Snackbar, msg);
    },

    /**
     * @returns {Promise.<Metadata>}
     */
    createMetadata() {
      return new Promise((resolve, reject) => {
        if (this.isNew) {
          const defaultName = this._defaultName(this.buffer, this.type);
          if (!this.autoName && this.filename === null) {
            this.$refs.prompt.open({
              message: 'Enter a filename',
              value: defaultName,
              onCancel: () => {
                this.filename = null;
                this.actions = [];
              },
              onConfirm: (value) => {
                this.filename = value;
                const actions = this.actions.length ? this.actions : ['save'];
                this.perform(...actions);
              }
            });

            reject('Interrupt for dialog');
            return;
          }

          let name = this.filename || defaultName;
          fs.new(this.directory, name).then(name => {
            const metadata = FileBuilder.file(`${this.directory.path}/${name}`, this.buffer);
            resolve(metadata);
          });
        } else {
          const metadata = FileBuilder.data(this.metadata, this.buffer);
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
        EventBus.instance().emit(Constants.Event.Sync.Start);
      }
    }
  }
};
</script>
