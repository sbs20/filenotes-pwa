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
        if (metadata === undefined || metadata.tag !== 'file') {
          this.$router.push('/list');
          return;
        }

        this.metadata = metadata;
        fs.read(metadata.key).then(buffer => {
          this.type = FilePath.create(metadata.path).type;
          this.originalHash = metadata.hash;
          this.savedHash = metadata.hash;
          this.buffer = Buffer.from(buffer);
        });
      });
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    save() {
      return new Promise(resolve => {
        const metadata = FileMetadata.create().assign(this.metadata).data(this.buffer).value;
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

    sync() {
      if (this.autoSync && this.savedHash !== this.originalHash) {
        this.$root.$emit(Constants.Event.Sync.Start);
      }
    }
  }
};
</script>
