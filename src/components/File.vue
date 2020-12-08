<template>
  <div>
    <navigation :menu="false">
      <template v-slot:header>
        {{ metadata.name }}
      </template>
      <template v-slot:end>
        <b-navbar-item v-if="!autoSave" @click="save"><b-icon icon="content-save"></b-icon></b-navbar-item>
        <b-navbar-item @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <file-editor :type="type" v-model="buffer" @save="save"></file-editor>

    <b-modal :active.sync="showClose" has-modal-card trap-focus
      :destroy-on-hide="true" aria-role="dialog" aria-modal>
      <div class="modal-card">
        <header class="modal-card-head">Save?</header>
        <section class="modal-card-body">
          {{ metadata.name }} has changed. Do you want to save before closing?
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="onCloseDialog('cancel')">Cancel</button>
          <button class="button is-danger" @click="onCloseDialog('close')">No</button>
          <button class="button is-success" @click="onCloseDialog('save-close')">Yes</button>
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

const helpers = {
  /**
   * @param {FileType} type
   */
  defaultExtension(type) {
    switch (type) {
      case 'text':
        return 'txt';
      case 'audio':
        return 'mp3';
      case 'image':
        return 'jpg';
      default:
        return 'unknown';
    }
  },

  /**
   * @param {BufferLike} buffer 
   * @param {FileType} type
   */
  defaultName(buffer, type) {
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

    const extension = this.defaultExtension(type);
    return `${name}.${extension}`;
  },

  /**
   * @param {Metadata} directory
   * @param {string} name
   * @param {BufferLike} buffer
   * @returns {Metadata}
   */
  async createMetadata(directory, name, buffer) {
    return FileMetadata.create()
      .path(`${directory.path}/${name}`)
      .data(buffer)
      .value;
  }
};

export default {
  name: 'File',

  beforeRouteLeave(to, from, next) {
    if (this.forceClose || this.isSaved()) {
      next();
    } else {
      next(false);
      if (this.autoSave) {
        this.save().then(() => {
          this.sync();
          this.close();
        });
      } else {
        this.showClose = true;
      }
    }
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
      forceClose: false,
      showClose: false,

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
      if (event.keyCode === 27) {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      }
    },

    isSaved() {
      const metadata = FileMetadata.create().assign(this.metadata).data(this.buffer).value;
      return this.savedHash === metadata.hash;
    },

    onCloseDialog(action) {
      this.showClose = false;
      switch (action) {
        case 'save-close':
          this.save().then(() => {
            this.sync();
            this.close();
          });
          break;

        case 'close':
          this.forceClose = true;
          this.close();
          break;

        case 'cancel':
        default:
          // do nothing
          break;
      }
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
          this.forceClose = true;
          this.$router.push('/list');
          return;
        }

        this.type = this.$route.query.type;
        if (metadata.tag === 'folder' && this.type) {
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
    asMetadata() {
      return new Promise(resolve => {
        if (this.metadata.name === undefined) {
          const name = helpers.defaultName(this.buffer, this.type);
          fs.new(this.directory, name).then(name => {
            const metadata = helpers.createMetadata(this.directory, name, this.buffer);
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
          }
          resolve();
        });
      });
    },

    /**
     * @returns {Promise.<void>}
     */
    save() {
      return this.asMetadata().then(metadata => {
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
