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

    <file-item ref="fileItem" :autoSync="autoSync" v-model="current"></file-item>
  </div>
</template>

<script>
import LocalProvider from '../classes/local-provider';
import Navigation from './Navigation';
import FileItem from './FileItem';

export default {
  name: 'File',

  beforeRouteLeave(to, from, next) {
    // Catches back button (close is not called)
    this.beforeClose().then(close => {
      if (close) {
        next();
      } else {
        next(false);
      }
    });
  },

  components: {
    FileItem,
    Navigation
  },

  data() {
    return {
      autoSave: true,
      autoSync: true,

      /** @type {Metadata} */
      current: {},
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

    afterClose() {
      this.$router.go(-1);
    },

    /**
     * @returns {Promise.<boolean>}
     */
    beforeClose() {
      return new Promise(resolve => {
        this.$refs.fileItem.hasChanged().then(changed => {
          if (changed) {
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
      });
    },

    close() {
      this.beforeClose().then(close => {
        if (close) {
          this.afterClose();
        }
      });
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      this.type = 'unknown';
      LocalProvider.instance().get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        this.current = current;
      });
    },

    save() {
      this.$refs.fileItem.save();
    },
  }
};
</script>
