<template>
  <div>
    <template v-if="type === 'text'">
      <prism-text-editor v-if="textEditor === 'prism'" :autofocus="autoFocus" v-model="buffer" @input="update"></prism-text-editor>
      <highlight-text-editor v-if="textEditor === 'highlight'" :autofocus="autoFocus" v-model="buffer" @input="update"></highlight-text-editor>
      <plain-text-editor v-if="textEditor === 'plain'" :autofocus="autoFocus" v-model="buffer" @input="update"></plain-text-editor>
    </template>
    <image-editor v-if="type === 'image'" v-model="buffer"></image-editor>
    <audio-editor v-if="type === 'audio'" v-model="buffer"></audio-editor>
    <div v-if="type === 'unknown'">Unknown file type</div>
  </div>
</template>

<script>
import Constants from '../classes/constants';
import Settings from '../classes/settings';

import AudioEditor from './editors/AudioEditor';
import ImageEditor from './editors/ImageEditor';
import HighlightTextEditor from './editors/HighlightTextEditor';
import PlainTextEditor from './editors/PlainTextEditor';
import PrismTextEditor from './editors/PrismTextEditor';

export default {
  name: 'FileEditor',
  props: {
    type: String,
    value: Buffer,
  },

  components: {
    AudioEditor,
    ImageEditor,
    PlainTextEditor,
    PrismTextEditor,
    HighlightTextEditor
  },

  data() {
    return {
      autoFocus: false,
      buffer: null,
      textEditor: null
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
    value() {
      this.load();
    }
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.s && event.ctrlKey) {
        this.$emit('save');
        event.preventDefault();
      }
    },

    load() {
      Settings.instance().autoFocus.get().then(autoFocus => {
        this.autoFocus = autoFocus;
        Settings.instance().textEditor.get().then(editor => {
          // this.textEditor = 'custom';
          // console.log(editor);
          this.textEditor = editor;
        });
      });

      if (this.value !== undefined) {
        this.buffer = this.value;
      }
    },

    update() {
      this.$emit('input', this.buffer);
    }
  }
};
</script>
