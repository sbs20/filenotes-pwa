<template>
  <div>
    <div>
      <pre id="log">{{ text }}</pre>
    </div>
  </div>
</template>

<script>
import Constants from '../classes/constants';
import Logger from '../classes/logger';

export default {
  name: 'Console',

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
      if (event.keyCode === Constants.Keys.escape) {
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
  font-family: Cascadia Code, Courier, monospace;
  line-height: 1em;
  padding: 0.5em;
  width: 100%;
}
pre {
  white-space: pre-wrap;
}
</style>
