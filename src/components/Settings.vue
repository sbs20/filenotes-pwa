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
            Autosave. Automatically saves notes when you close.
          </template>
          <template v-slot:action>
            <div class="field">
              <b-switch v-model="autoSave"></b-switch>
            </div>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Autosync. Automatically syncs notes.
          </template>
          <template v-slot:action>
            <div class="field">
              <b-switch v-model="autoSync"></b-switch>
            </div>
          </template>
        </settings-item>

        <settings-item>
          <template v-slot:description>
            Reset cursor. Filenotes will no longer know what it has synced and
            will check every file again. Provided you have local files it will
            still check file hashes and versions.
          </template>
          <template v-slot:action>
            <button class="button is-primary" @click="clearCursor">Reset</button>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Delete local changes. This will remove records of local changes.
            This means that they will not be uploaded. If remote files have
            changed then they may overwrite your local files.
          </template>
          <template v-slot:action>
            <button class="button is-warning" @click="clearLocalDeltas">Clear</button>
          </template>
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
import Settings from '../classes/settings';
import Storage from '../classes/data/storage';
import RemoteProvider from '../classes/remote-provider';
import Navigation from './Navigation';
import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';

const log = Logger.get('Settings');
const settings = Settings.instance();
const storage = Storage.instance();
const remote = RemoteProvider.instance();

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
    settings.autoSave.get().then(value => {
      this.autoSave = value;
    });
    settings.autoSync.get().then(value => {
      this.autoSync = value;
    });

    return {
      accountName: '',
      accountEmail: '',
      autoSave: true,
      autoSync: true
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
      settings.name.get().then(name => {
        this.accountName = name;
      });
      settings.email.get().then(email => {
        this.accountEmail = email;
      });
    },

    notify(msg) {
      log.info(msg);
      this.$buefy.snackbar.open(msg);
    },

    close() {
      this.$router.go(-1);
    },

    clearCursor() {
      settings.cursor.delete().then(() => {
        this.notify('Cursor cleared');
      });
    },

    clearLocalDeltas() {
      storage.fs.delta.clear().then(() => {
        this.notify('Local deltas cleared');
      });
    },

    clearLocalFs() {
      Promise.all([
        storage.fs.metadata.clear(),
        storage.fs.content.clear(),
        storage.fs.delta.clear()
      ]).then(() => {
        this.notify('Local database cleared');
      });
    },

    clearLog() {
      // TODO
    },

    logout() {
      remote.clear().then(() => {
        this.notify('Logged out');
      });
    },

    nukeDatabase() {
      storage.deleteDatabase().then(() => {
        this.notify('Local database deleted');
      });
    },

    forceAuthentication() {
      remote.startAuthentication(window);
    },

    causeRemoteError() {
      remote.read('/non-existent-file');
    },

    connect1() {
      remote.startFromToken().then(this.afterConnect);
    },

    connect2() {
      remote.startFromQueryString(window.location.search).then(this.afterConnect);
    },
  },

  watch: {
    autoSave() {
      settings.autoSave.set(this.autoSave).then(() => {
        this.notify(`Autosave: ${this.autoSave ? 'on' : 'off'}`);
      });
    },

    autoSync() {
      settings.autoSync.set(this.autoSync).then(() => {
        this.notify(`Autosync: ${this.autoSync ? 'on' : 'off'}`);
      });
    }
  }
};
</script>
<style scoped>
.float-right {
  float: right;
}
</style>