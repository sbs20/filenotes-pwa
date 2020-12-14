<template>
  <div class="hightlight-container">
    <v-textarea v-if="text !== null" autofocus auto-grow ref="textarea" class="editor editor-text" v-model="text"
      @input="update"></v-textarea>
    <pre class="editor-text display" v-html="pretty"></pre>
  </div>
</template>

<script>
import 'vue-prism-editor/dist/prismeditor.min.css';

// import highlighting library
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';

import 'prismjs/themes/prism.css';
//import 'prismjs/themes/prism-funky.css';
//import 'prismjs/themes/prism-twilight.css';
//import 'prismjs/themes/prism-tomorrow.css';

export default {
  name: 'HighlightTextEditor',

  props: {
    /** @type {Buffer} */
    value: Buffer,
  },

  created() {
    this.load();
  },

  mounted() {
    /** @type {HTMLInputElement} */
    // const textarea = this.$refs.textarea;
    // textarea.setSelectionRange(0, 0);
    // textarea.focus();
  },

  computed: {
    pretty() {
      return this.highlighter(this.text);
    }
  },

  data() {
    return {
      /** @type {string} */
      text: null
    };
  },

  watch: {
    value() {
      this.load();
    }
  },

  methods: {
    load() {
      if (this.value) {
        this.text = this.value.toString();
      }
    },

    highlighter(text) {
      const language = languages.md;
      return highlight(text, language);
    },

    update() {
      this.$emit('input', Buffer.from(this.text));
    }
  }
};
</script>

<style scoped>
/* .highlight-container {
  position: relative;
  text-align: left;
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
  width: 100%;
} */

.editor {
  /* position: absolute; */
  position: relative;
  background-color: transparent;
}

.editor-text {
  font-family: Cascadia Code, Courier, monospace;
  font-size: 1rem;
  line-height: 1.75rem;
  font-weight: 100;
}

pre.display {
  /* margin-top: 16px; */
  position: relative;
  /* box-sizing: inherit; */
  white-space: pre-wrap;
  /* width: 100%; */
  display: inline;
}
</style>

<style>
div.v-textarea.editor textarea {
  position: absolute;
  color: red !important;
  background-color: transparent !important;
  white-space: pre-wrap;
  width: 100%;
  /* z-index: 5 !important; */
}

/* Required to override Vueify */
pre.display .title {
  font-family: Cascadia Code, Courier, monospace !important;
  font-size: 1rem !important;
  line-height: 1.75rem;
  letter-spacing: -0.02rem !important;
}

/* .prism-editor__textarea {
  white-space: nowrap;
  overflow: auto;
} */

/* Removing the outline, and show the caret (?) */
.prism-editor__textarea:focus {
  outline: none;
}
</style>
