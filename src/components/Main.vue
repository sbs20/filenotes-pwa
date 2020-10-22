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
      const accessToken = await Storage.settings.get('accessToken');
      if (accessToken === undefined) {
        return false;
      }

      this.remote = new DropboxService({
        clientId: Constants.APP_ID,
        accessToken: accessToken });

      const connected = await this.remote.connect();
      if (!connected) {
        await Storage.settings.delete('accessToken');
      }

      return connected;
    },

    startAuthentication() {
      const dbs = new DropboxService({
        clientId: Constants.APP_ID,
        authUrl: Constants.HOST_URL });
      const uri = dbs.authenticationUrl();
      window.location.href = uri;
    },

    async init() {
      if (!(await this.connect())) {
        const accessToken = Common.parseQueryString(window.location.hash).access_token;
        if (accessToken) {
          await Storage.settings.set('accessToken', accessToken);
          if (!(await this.connect())) {
            this.startAuthentication();
          }
        } else {
          this.startAuthentication();
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
