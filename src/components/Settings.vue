<template>
  <div>
    <settings-section>
      <template v-slot:title>Behaviour and UI</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            Theme.
          </template>
          <template v-slot:action>
            <div class="field">
              <v-select label="Theme" :items="themes" v-model="theme"></v-select>
            </div>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Autoname. Automatically names notes when you save.
          </template>
          <template v-slot:action>
            <div class="field">
              <v-switch v-model="autoName"></v-switch>
            </div>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Autosave. Automatically saves notes when you close.
          </template>
          <template v-slot:action>
            <div class="field">
              <v-switch v-model="autoSave"></v-switch>
            </div>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Autosync. Automatically syncs notes.
          </template>
          <template v-slot:action>
            <div class="field">
              <v-switch v-model="autoSync"></v-switch>
            </div>
          </template>
        </settings-item>
      </template>
    </settings-section>

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
            <v-btn color="primary" @click="clearCursor">Reset</v-btn>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Delete local changes. This will remove records of local changes.
            This means that they will not be uploaded. If remote files have
            changed then they may overwrite your local files.
          </template>
          <template v-slot:action>
            <v-btn color="warning" @click="clearLocalDeltas">Clear</v-btn>
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
            <v-btn color="primary" @click="logout">Logout</v-btn>
          </template>
        </settings-item>
        <settings-item>
          <template v-slot:description>
            Force authentication.  
          </template>
          <template v-slot:action>
            <v-btn color="success" @click="forceAuthentication">Login</v-btn>
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
            <v-btn color="primary" @click="clearLocalFs">Clear</v-btn>
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
            <v-btn color="error" @click="nukeDatabase">Nuke</v-btn>
          </template>
        </settings-item>
      </template>
    </settings-section>
  </div>
</template>

<script>
import Logger from '../classes/logger';
import Settings from '../classes/settings';
import Storage from '../classes/data/storage';
import RemoteProvider from '../classes/remote-provider';
import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';
import Constants from '../classes/constants';

const log = Logger.get('Settings');
const settings = Settings.instance();
const storage = Storage.instance();
const remote = RemoteProvider.instance();

export default {
  name: 'Settings',
  components: {
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
      accountEmail: '',
      autoName: true,
      autoSave: true,
      autoSync: true,
      theme: Constants.Themes.Light,
      themes: [
        {
          text: 'Light',
          value: Constants.Themes.Light
        },
        {
          text: 'Dark',
          value: Constants.Themes.Dark
        }
      ]
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
      settings.autoName.get().then(value => {
        this.autoName = value;
      });
      settings.autoSave.get().then(value => {
        this.autoSave = value;
      });
      settings.autoSync.get().then(value => {
        this.autoSync = value;
      });
      settings.name.get().then(name => {
        this.accountName = name;
      });
      settings.email.get().then(email => {
        this.accountEmail = email;
      });
      settings.theme.get().then(theme => {
        this.theme = theme;
      });
    },

    notify(msg) {
      log.info(msg);
      this.$root.$emit(Constants.Event.Snackbar, msg);
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
      remote.authenticate(window);
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
    autoName() {
      settings.autoName.set(this.autoName).then(() => {
        this.notify(`Autoname: ${this.autoName ? 'on' : 'off'}`);
      });
    },

    autoSave() {
      settings.autoSave.set(this.autoSave).then(() => {
        this.notify(`Autosave: ${this.autoSave ? 'on' : 'off'}`);
      });
    },

    autoSync() {
      settings.autoSync.set(this.autoSync).then(() => {
        this.notify(`Autosync: ${this.autoSync ? 'on' : 'off'}`);
      });
    },

    theme() {
      settings.theme.set(this.theme).then(() => {
        //this.notify(`Autosync: ${this.autoSync ? 'on' : 'off'}`);
        this.$root.$emit(Constants.Event.App.Reload);
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