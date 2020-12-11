<template>
  <div>
    <div class="float-right"><img src="../../public/img/filenotes-88.png"></div>
    <div class="text-h4">Filenotes v{{ version }}</div>
    <div>Access and edit your files locally</div>
  </div>
</template>

<script>
import Constants from '../classes/constants';

export default {
  name: 'About',

  created() {
    document.addEventListener('keydown', this._onKeys);
  },

  data() {
    return {
      version: Constants.Version
    };
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 27) {
        this.close();
      }
    },

    close() {
      this.$router.go(-1);
    }
  }
};
</script>
