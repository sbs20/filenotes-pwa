<template>
  <div>
    <navigation>
      <template v-slot:header>Console</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div>
      <pre id="log">{{ text }}</pre>
    </div>
  </div>
</template>

<script>
import Logger from '../classes/logger';
import Navigation from './Navigation';

export default {
  name: 'Console',
  components: {
    Navigation
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    Logger.subscriber = msg => this.messages.push(msg);
  },

  computed: {
    text() {
      let value = '';
      for (let index = this.messages.length - 1; index > -1; index--) {
        value += `${this.messages[index]}\n`;
      }
      return value;
    }
  },

  data() {
    return {
      messages: [...Logger.messages]
    };
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
    Logger.subscriber = undefined;
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 27) {
        this.close();
      }
    },

    close() {
      this.$router.go(-1);
    },
  }
};
</script>

<style scoped>
#log {
  background-color: rgba(0, 0, 0, 0);
  resize: none;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  line-height: 1em;
  padding: 0.5em;
  width: 100%;
}
pre {
    white-space: pre-wrap;
}
</style>
