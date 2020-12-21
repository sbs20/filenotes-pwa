<template>
  <div>
    <div v-if="!connected" class="d-flex flex-row mt-4 justify-center">
      <v-btn color="primary" @click="authenticate">Authenticate with Dropbox</v-btn>
    </div>
    <div class="d-flex flex-row mt-4 justify-center">
      <img src="../../public/img/filenotes-88.png">
    </div>
    <div class="d-flex flex-row mt-4 justify-center">
      <div class="text-h2">Filenotes v{{ version }}</div>
    </div>

    <div class="text-h4 mt-4">What is filenotes?</div>
    <div class="body-1 mt-4">
      Filenotes is a note taking app which uses plain old files and directories to
      avoid lock-in with proprietory formats. Create and edit text files, view
      images and play audio; organise your files in directories, choose how to
      sort, search content and titles, autoname files, automatically sync updates,
      use your system theme (or override) and, of course, it works offline so
      long as you are using a browser built after 2017. You don't even need to
      install it (although you won't get offline access).
    </div>

    <div class="text-h4 mt-4">Sync your data</div>
    <div class="body-1 mt-4">
      Sync files with Dropbox in its own scoped directory
      (~/Apps/filenotes.app/). Open the files on your device with the Dropbox
      app, notepad, vi or emacs. Sync is fast because Filenotes keeps track of
      changes, versions and file hashes and it will avoid overwriting conflicts.
    </div>

    <div class="text-h4 mt-4">Privacy</div>
    <div class="body-1 mt-4">
      Your data is your own. Data is stored in the browser - you can find it, if
      you're so inclined, in your local IndexedDB. And it is synced with Dropbox.
      No data is stored on the Filenotes servers, There is no tracking, no adverts,
      no telemetry, no cookies and so no annoying popups. Awesome.
    </div>

    <div class="text-h4 mt-4">License</div>
    <div class="body-1 mt-4">
      This software is free to use and licensed under MIT. The source code is
      available at <a href="">GitHub</a>.
    </div>

  </div>
</template>

<script>
import Constants from '../classes/constants';
import Context from '../classes/context';

export default {
  name: 'About',

  created() {
    document.addEventListener('keydown', this._onKeys);
  },

  data() {
    return {
      connected: Context.instance().remote.connected,
      version: Constants.Version
    };
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.escape) {
        this.close();
      }
    },

    authenticate() {
      Context.instance().remote.authenticate(window);
    },

    close() {
      this.$router.go(-1);
    }
  }
};
</script>
