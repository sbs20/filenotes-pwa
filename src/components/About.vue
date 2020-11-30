<template>
  <div>
    <navigation>
      <template v-slot:header>About</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div class="box">
      <div class="columns is-mobile">
        <div class="column is-9">
          <div class="container">
            <h1 class="title">
              Filenotes v{{ version }}
            </h1>
            <h2 class="subtitle">
              Access and edit your files locally
            </h2>
          </div>
          <div class="container">
            
          </div>
        </div>
        <div class="column is-3">
          <img src="../../public/img/filenotes-88.png">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Constants from '../classes/constants';
import Navigation from './Navigation';

export default {
  name: 'About',
  components: {
    Navigation
  },

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
      this.$router.push('/l/');
    }
  }
};
</script>
