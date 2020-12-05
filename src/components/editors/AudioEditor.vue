<template>
  <div>
    <av-waveform v-if="src" canv-class="audio-canvas"
      :audio-src="src" :canv-top="true" :audio-controls="false"></av-waveform>
    <audio class="audio-control" v-if="src" controls :src="src"></audio>
  </div>
</template>

<script>
import Convert from '../../classes/utils/convert';

export default {
  name: 'AudioEditor',

  props: {
    /** @type {Buffer} */
    value: Buffer,
  },

  created() {
    this.load();
  },

  data() {
    return {
      src: null
    };
  },

  watch: {
    value() {
      this.load();
    }
  },

  destroyed() {
    this.release();
  },

  methods: {
    load() {
      this.release();
      if (this.value) {
        const blob = Convert.arrayBufferToBlob(this.value);
        this.src = window.URL.createObjectURL(blob);
      }
    },

    release() {
      if (this.src) {
        URL.revokeObjectURL(this.src);
      }
    }
  }
};
</script>
