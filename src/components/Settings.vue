<template>
  <div>
    <navigation>
      <template v-slot:header>Settings</template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <settings-section>
      <template v-slot:title>Sync</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            Reset cursor. Filenotes will no longer know what it has synced and
            will check every file again. Provided you have local files it will
            still check file hashes and versions.
          </template>
          <template v-slot:action>
            <button class="button is-primary" @click="clearCursor">Reset</button>          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Delete local changes. This will remove records of local changes.
            This means that they will not be uploaded. If remote files have
            changed then they may overwrite your local files.
          </template>
          <template v-slot:action>
            <button class="button is-warning" @click="clearLocalDeltas">Clear</button>          </template>
        </settings-item>
      </template>
    </settings-section>

    <settings-section>
      <template v-slot:title>Connection</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            {{ accountName }} ({{ accountEmail }})
          </template>
          <template v-slot:action>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Reset connection. This will clear your authentication token and
            local account settings and require you to log in again.
          </template>
          <template v-slot:action>
            <button class="button is-primary" @click="logout">Logout</button>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Force authentication.  
          </template>
          <template v-slot:action>
            <button class="button is-success" @click="forceAuthentication">Login</button>
          </template>
        </settings-item>
      </template>
    </settings-section>

    <settings-section>
      <template v-slot:title>Local files</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>Clear local filesystem</template>
          <template v-slot:action>
            <button class="button is-primary" @click="clearLocalFs">Clear</button>
          </template>
        </settings-item>
      </template>
    </settings-section>

    <settings-section>
      <template v-slot:title>Local storage</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            Nuke database. Completely remove all local files, pending updates
            and connection settings.
          </template>
          <template v-slot:action>
            <button class="button is-danger" @click="nukeDatabase">Nuke</button>
          </template>
        </settings-item>
      </template>
    </settings-section>

    <!-- <div>      
      <button class="button" @click="connect1">Connect from storage</button>
      <button class="button" @click="connect2">Connect from code</button>
      <button class="button" @click="connect3">Force auth</button>
    </div> -->
  </div>
</template>

<script>
import Logger from '../classes/logger';
import { RemoteProvider, StorageService } from '../services';
import Navigation from './Navigation';
import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';
import Constants from '../classes/constants';

const log = Logger.get('Settings');

export default {
  name: 'Settings',
  components: {
    Navigation,
    SettingsSection,
    SettingsItem
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    this.load();
  },

  data() {
    return {
      accountName: '',
      accountEmail: ''
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

    load() {
      StorageService.settings.get(Constants.Settings.Name).then(name => {
        this.accountName = name;
      });
      StorageService.settings.get(Constants.Settings.Email).then(email => {
        this.accountEmail = email;
      });
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    close() {
      this.$router.push('/l/');
    },

    clearCursor() {
      StorageService.settings.delete('cursor').then(() => {
        this.notify('Cursor cleared');
      });
    },

    clearLocalDeltas() {
      StorageService.fs.delta.clear().then(() => {
        this.notify('Local deltas cleared');
      });
    },

    clearLocalFs() {
      Promise.all([
        StorageService.fs.metadata.clear(),
        StorageService.fs.content.clear(),
        StorageService.fs.delta.clear()
      ]).then(() => {
        this.notify('Local database cleared');
      });
    },

    clearLog() {
      // TODO
    },

    logout() {
      RemoteProvider.clear().then(() => {
        this.notify('Logged out');
      });
    },

    nukeDatabase() {
      StorageService.deleteDatatabase().then(() => {
        this.notify('Local database deleted');
      });
    },

    forceAuthentication() {
      RemoteProvider.startAuthentication(window);
    },

    causeRemoteError() {
      RemoteProvider.read('/non-existent-file');
    },

    connect1() {
      RemoteProvider.startFromToken().then(this.afterConnect);
    },

    connect2() {
      RemoteProvider.startFromQueryString(window.location.search).then(this.afterConnect);
    },
  }
};
</script>
<style scoped>
.float-right {
  float: right;
}
</style>