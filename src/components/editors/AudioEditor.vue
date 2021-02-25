<template>
  <div>
    <av-waveform v-if="src"
      :audio-src="src"
      :canv-top="true"
      :audio-controls="false"
      :canv-width="width"
      canv-height="60"
      played-line-color="#49a6D2"
      noplayed-line-color="#1976D2"
      playtime-slider-color="#808080"
      playtime-slider-width="5"></av-waveform>
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
      src: null,
      width: window.innerWidth - 40
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
