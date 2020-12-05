<template>
  <div>
    <img v-if="src" :src="src" />
  </div>
</template>

<script>
import Convert from '../../classes/utils/convert';

export default {
  name: 'ImageEditor',

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
