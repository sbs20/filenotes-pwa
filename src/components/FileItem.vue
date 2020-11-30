<template>
  <div>
    <prism-editor v-if="type === 'text'" class="editor" v-model="text"
      :highlight="highlighter" :line-numbers="false"></prism-editor>
    <av-waveform v-if="type === 'audio'" canv-class="audio-canvas"
      :audio-src="audioSrc" :canv-top="true" :audio-controls="false"></av-waveform>
    <audio class="audio-control" v-if="type === 'audio'" controls :src="audioSrc"></audio>
    <img v-if="imageSrc" :src="imageSrc" />
  </div>
</template>

<script>
import Convert from '../classes/utils/convert';
import FilePath from '../classes/files/file-path';
import FileMetadata from '../classes/files/file-metadata';
import Logger from '../classes/logger';
import { LocalProvider } from '../services';
import { PrismEditor } from 'vue-prism-editor';

import 'vue-prism-editor/dist/prismeditor.min.css';

// import highlighting library
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

const log = Logger.get('FileItem');

export default {
  name: 'FileItem',
  props: {
    /** @type {Metadata} */
    value: Object
  },

  components: {
    PrismEditor
  },

  data() {
    return {
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
    document.addEventListener('keydown', this._onKeys);
  },

  destroyed() {
    this.release();
    document.removeEventListener('keydown', this._onKeys);
  },

  watch: {
    value() {
      this.load();
    }
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 83 /* s */ && event.ctrlKey) {
        this.save();
        event.preventDefault();
      }
    },

    hasChanged() {
      return new Promise(resolve => {
        if (this.text) {
          const buffer = Convert.stringToArrayBuffer(this.text);
          const metadata = FileMetadata.create().assign(this.value).data(buffer).value;
          LocalProvider.get(metadata.key).then(existing => {
            if (existing && existing.hash === metadata.hash) {
              resolve(false);
            }
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    },

    highlighter(code) {
      const language = languages.md;
      return highlight(code, language);
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    release() {
      if (this.audioSrc) {
        URL.revokeObjectURL(this.audioSrc);
      }
      if (this.imageSrc) {
        URL.revokeObjectURL(this.imageSrc);
      }
    },

    load() {
      /** @type {Metadata} */
      const metadata = this.value;
      if (metadata && metadata.key) {
        const type = FilePath.create(metadata.path).type;
        LocalProvider.read(metadata.key).then(buffer => {
          this.release();
          this.text = null;
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
      }
    },

    save() {
      if (this.text) {
        const buffer = Convert.stringToArrayBuffer(this.text);
        const metadata = FileMetadata.create().assign(this.value).data(buffer).value;
        LocalProvider.write(metadata, buffer).then((saved) => {
          if (saved) {
            this.notify(`Saved ${metadata.name}`);
            log.debug('Saved', this.value);
            this.$emit('value', metadata);
          }
        });
      } else {
        log.debug('No text to save');
      }
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
  /* caret-color: aqua; */
}

</style>

<style>
.prism-editor__editor .title {
  font-size: 1rem;
}

/* Removing the outline, and show the caret (?) */
.prism-editor__textarea:focus {
  outline: #2d2d2d;
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

