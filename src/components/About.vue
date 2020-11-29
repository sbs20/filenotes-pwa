<template>
  <div>
    <navigation>
      <template v-slot:header>About</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div>
      About Filenotes
    </div>
  </div>
</template>

<script>
import Navigation from './Navigation';

export default {
  name: 'About',
  components: {
    Navigation
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
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
      this.$router.push('/l/');
    }
  }
};
</script>
