<template>
  <div>
    <prism-editor v-if="text !== null" ref="editor" class="editor" v-model="text"
      :highlight="highlighter" :line-numbers="false" @input="update"></prism-editor>
  </div>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor';

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
  name: 'TextEditor',

  components: {
    PrismEditor
  },

  props: {
    /** @type {Buffer} */
    value: Buffer,
  },

  created() {
    this.load();
  },

  mounted() {
    /** @type {HTMLInputElement} */
    const textarea = this.$refs.editor.$refs.textarea;
    textarea.setSelectionRange(0, 0);
    textarea.focus();
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

    highlighter(code) {
      const language = languages.md;
      return highlight(code, language);
    },

    update() {
      this.$emit('input', Buffer.from(this.text));
    }
  }
};
</script>

<style scoped>
/* required class */
.editor {
  /* color: #ccc; */
  font-family: Cascadia Code, Courier, monospace;
  font-size: 1rem;
  line-height: 1.75rem;
  min-height: 12rem;
  font-weight: 100;
}
</style>

<style>
/* Required to override Vueify */
pre.prism-editor__editor .title {
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
