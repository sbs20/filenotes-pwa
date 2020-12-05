<template>
  <div>
    <text-editor v-if="type === 'text'" v-model="buffer" @input="update"></text-editor>
    <image-editor v-if="type === 'image'" v-model="buffer"></image-editor>
    <audio-editor v-if="type === 'audio'" v-model="buffer"></audio-editor>
  </div>
</template>

<script>
import AudioEditor from './editors/AudioEditor';
import ImageEditor from './editors/ImageEditor';
import TextEditor from './editors/TextEditor';

export default {
  name: 'FileEditor',
  props: {
    /** @type {string} */
    type: String,

    /** @type {Buffer} */
    value: Buffer,
  },

  components: {
    AudioEditor,
    ImageEditor,
    TextEditor
  },

  data() {
    return {
      buffer: null
    }
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
      if (event.keyCode === 83 /* s */ && event.ctrlKey) {
        this.$emit('save');
      }
    },

    load() {
      if (this.value) {
        this.buffer = this.value;
      }
    },

    update() {
      this.$emit('input', this.buffer);
    }
  }
};
</script>
