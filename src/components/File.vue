<template>
  <div>
    <navigation>
      <template v-slot:header>
        {{ current.name }}
      </template>
      <template v-slot:end>
        <b-navbar-item @click="save"><b-icon icon="content-save"></b-icon></b-navbar-item>
        <b-navbar-item @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div class="container">
      <prism-editor v-if="type === 'text'" class="editor" v-model="text"
        :highlight="highlighter" :line-numbers="false"></prism-editor>
      <av-waveform v-if="type === 'audio'" canv-class="audio-canvas"
        :audio-src="audioSrc" :canv-top="true" :audio-controls="false"></av-waveform>
      <audio class="audio-control" v-if="type === 'audio'" controls :src="audioSrc"></audio>
      <img v-if="imageSrc" :src="imageSrc" />
    </div>
  </div>
</template>

<script>
import Convert from '../classes/utils/convert';
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import LocalProvider from '../classes/local-provider';
import Log from '../classes/log';
import { PrismEditor } from 'vue-prism-editor';

import Navigation from './Navigation';

import 'vue-prism-editor/dist/prismeditor.min.css';

// import highlighting library
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

const log = Log.get('File');

export default {
  name: 'File',
  components: {
    PrismEditor,
    Navigation
  },

  data() {
    return {
      /** @type {Metadata} */
      current: {},

      /** @type {FileType} */
      type: 'unknown',

      /** @type {string} */
      text: null,

      audioSrc: null,
      imageSrc: null
    };
  },

  created() {
    this.load();
  },

  destroyed() {
    this.release();
  },

  watch: {
    $route() {
      this.load();
    }
  },

  methods: {
    highlighter(code) {
      const language = languages.md;
      return highlight(code, language);
    },

    release() {
      if (this.audioSrc) {
        URL.revokeObjectURL(this.audioSrc);
      }
      if (this.imageSrc) {
        URL.revokeObjectURL(this.imageSrc);
      }
    },

    close() {
      const parent = FilePath.create(this.current.key).directory;
      this.$router.push(`/l/${parent}`);
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      this.type = 'unknown';
      LocalProvider.get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        const type = FilePath.create(path).type;
        this.current = current;
        this.text = null;
        LocalProvider.read(this.current.key).then(buffer => {
          switch (type) {
            case 'text':
              this.text = Convert.arrayBufferToString(buffer);
              break;

            case 'audio': {
              const blob = Convert.arrayBufferToBlob(buffer);
              this.audioSrc = window.URL.createObjectURL(blob);
              break;
            }
            case 'image': {
              const blob = Convert.arrayBufferToBlob(buffer);
              this.imageSrc = window.URL.createObjectURL(blob);
              break;
            }
          }

          this.type = type;
        });
      });
    },

    /**
     * @param {Metadata} entry
     */
    remove() {
      LocalProvider.delete(this.current.path).then(() => {
        this.close();
      });
    },

    /**
     * @param {Metadata} entry
     */
    rename(entry) {
      const name = window.prompt('New name');
      if (name) {
        const destination = `${this.current.path}/${name}`;
        LocalProvider.move(entry.key, destination).then(() => {
          this.close();
        });
      }
    },

    save() {
      const buffer = Convert.stringToArrayBuffer(this.text);
      FileMetadata.from(this.current, buffer).then(metadata => {
        LocalProvider.write(metadata, buffer).then(() => {
          log.debug('Saved', this.current);
        });
      });
    },
  }
};
</script>

<style scoped>
/* required class */
.editor {
  /* background: #2d2d2d; */
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 1em;
  line-height: 1.5em;
  padding: 0.5em;
  min-height: 12em;
  white-space: nowrap;
  overflow: auto;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: #2d2d2d;
}
</style>

<style>
.prism-editor__editor .title {
  font-size: 1rem;
}

.audio-canvas {
  background: #2d2d2d;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 1em;
  line-height: 1.5em;
  padding: 0.5em;
  width: 100%;
}
.audio-control {
  width: 100%;
}
</style>
