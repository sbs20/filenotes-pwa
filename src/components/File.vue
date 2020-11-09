<template>
  <div>
    <h2>{{ this.current.name }}</h2>
    <div v-if="content !== null">
      <input type="button" value="close" @click="close">
      <input type="button" value="save" @click="save">
      <prism-editor class="editor" v-model="content" :highlight="highlighter" line-numbers></prism-editor>
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

import 'vue-prism-editor/dist/prismeditor.min.css';

// import highlighting library
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/plugins/autolinker/prism-autolinker';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

const log = Log.get('List');

export default {
  name: 'File',
  components: {
    PrismEditor,
  },

  data() {
    this.load();
    return {
      /** @type {Metadata} */
      current: {},
      content: null
    };
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

    close() {
      const parent = FilePath.create(this.current.path).directory;
      this.$router.push(`/l/${parent}`);
    },

    load() {
      /** @type {string} */
      const path = this.$route.params.pathMatch;
      LocalProvider.get(path).then(current => {
        if (current === undefined || current.tag !== 'file') {
          this.$router.push('/l/');
          return;
        }

        this.current = current;
        this.content = null;
        LocalProvider.read(this.current.key).then(buffer => {
          this.content = `{${this.current.name}}`;
          if (this.current.name.endsWith('.txt')) {
            this.content = Convert.arrayBufferToString(buffer);
          } else if (this.current.name.endsWith('.mp3')) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            audioContext.decodeAudioData(buffer).then(audioData => {
              const source = audioContext.createBufferSource();
              source.buffer = audioData;
              source.connect(audioContext.destination);
              source.start(0);
              window.setTimeout(() => {
                source.stop(0);
              }, 5000);
            });
          }
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
      const buffer = Convert.stringToArrayBuffer(this.content);
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
  background: #2d2d2d;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 1em;
  line-height: 1.5em;
  padding: 0.5em;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}
</style>
