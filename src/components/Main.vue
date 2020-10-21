<template>
  <div class="hello">
    <h1>Filenotes</h1>
    <input type="button" value="Init" @click="init">
    <div v-if="remote">
      <input type="button" value="Go" @click="go">
      <textarea v-model="json"></textarea>
    </div>
  </div>
</template>

<script>
import DropboxService from '../js/dropbox-service';
import Constants from '../js/constants';
import Common from '../js/common';
import Storage from '../js/storage';

export default {
  name: 'Main',

  data() {
    return {
      remote: null,
      local: null,
      json: ''
    };
  },

  mounted() {
  },

  methods: {
    async connect() {
      const accessToken = await Storage.setting('accessToken');
      this.remote = new DropboxService({
        clientId: Constants.APP_ID,
        accessToken: accessToken });

      const connected = await this.remote.connect();
      if (!connected) {
        await Storage.setting('accessToken', null);
      }

      return connected;
    },

    async init() {
      if (!(await this.connect())) {
        const accessToken = Common.parseQueryString(window.location.hash).access_token;
        if (accessToken) {
          await Storage.setting('accessToken', accessToken);
          if (!(await this.connect())) {
            const dbs = new DropboxService({
              clientId: Constants.APP_ID,
              authUrl: 'http://localhost:8080' });
            const uri = dbs.startAuthorisation();
            window.location.href = uri;
          }
        }
      }
    },

    async go() {
      //https://stackoverflow.com/questions/40355660/how-to-use-dropbox-sdk-js-in-the-browser

      const files = await this.remote.list();
      console.log(files);
      this.json = JSON.stringify(files);
    },
  }
}
</script>

<style scoped>
</style>
