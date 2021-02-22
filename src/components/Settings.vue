<template>
  <div>
    <settings-section>
      <template v-slot:title>Behaviour and UI</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            Theme. If you use system theme and change it, you will need to reload the app.
          </template>
          <template v-slot:action>
            <div style="max-width: 9rem;">
              <v-select @change="update('theme', $event)" label="Theme" :items="themes" v-model="theme"></v-select>
            </div>
          </template>
        </settings-item>

        <settings-item>
          <template v-slot:description>
            Text editor.
          </template>
          <template v-slot:action>
            <div style="max-width: 9rem;">
              <v-select @change="update('textEditor', $event)" label="Text editor" :items="textEditors" v-model="textEditor"></v-select>
            </div>
          </template>
        </settings-item>

        <settings-item>
          <template v-slot:description>
            Autoname. Automatically names notes when you save.
          </template>
          <template v-slot:action>
            <v-switch @change="update('autoName', $event)" v-model="autoName"></v-switch>
          </template>
        </settings-item>

        <settings-item>
          <template v-slot:description>
            Autosave. Automatically saves notes when you close.
          </template>
          <template v-slot:action>
            <v-switch @change="update('autoSave', $event)" v-model="autoSave"></v-switch>
          </template>
        </settings-item>

        <settings-item>
          <template v-slot:description>
            Autofocus. Automatically Focuses the cursor in editable documents.
          </template>
          <template v-slot:action>
            <v-switch @change="update('autoFocus', $event)" v-model="autoFocus"></v-switch>
          </template>
        </settings-item>
      </template>
    </settings-section>

    <settings-section>
      <template v-slot:title>Cloud service and Sync</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>
            Cloud storage service.
          </template>
          <template v-slot:action>
            <div style="max-width: 9rem;">
              <v-select @change="update('storageService', $event)" label="Cloud Storage" :items="storageServices" v-model="storageService"></v-select>
            </div>
          </template>
        </settings-item>

        <template v-if="storageService !== 'none'">
          <template v-if="accountName">
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
          </template>

          <settings-item v-else>
            <template v-slot:description>
              Authenticate
            </template>
            <template v-slot:action>
              <v-btn color="success" @click="authenticate">Login</v-btn>
            </template>
          </settings-item>

          <settings-item>
            <template v-slot:description>
              Autosync. Automatically syncs notes.
            </template>
            <template v-slot:action>
              <v-switch @change="update('autoSync', $event)" v-model="autoSync"></v-switch>
            </template>
          </settings-item>

          <settings-item>
            <template v-slot:description>
              Foreground sync. Stops further editing while a sync is in progress.
              This reduces the likelihood of save conflicts if you quickly re-edit
              a note which is uploading.
            </template>
            <template v-slot:action>
              <v-switch @change="update('foregroundSync', $event)" v-model="foregroundSync"></v-switch>
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
      </template>
    </settings-section>

    <settings-section>
      <template v-slot:title>Danger zone</template>
      <template v-slot:items>
        <settings-item>
          <template v-slot:description>Clear local filesystem</template>
          <template v-slot:action>
            <v-btn color="primary" @click="clearLocalFs">Clear</v-btn>
          </template>
        </settings-item>
 
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
import Constants from '@/classes/constants';
import Context from '@/classes/context';
import EventBus from '@/classes/event-bus';
import Logger from '@/classes/logger';
import Settings from '@/classes/settings';
import Storage from '@/classes/data/storage';

import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';

const log = Logger.get('Settings');
const settings = Settings.instance();
const storage = Storage.instance();
const context = Context.instance();

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
      autoFocus: true,
      foregroundSync: true,
      storageService: Constants.StorageServices.Dropbox,
      storageServices: [
        {
          text: 'None (local only)',
          value: Constants.StorageServices.None
        },
        {
          text: 'Dropbox',
          value: Constants.StorageServices.Dropbox
        }
      ],
      textEditor: Constants.TextEditor.Plain, 
      textEditors: [
        {
          text: 'Plain',
          value: Constants.TextEditor.Plain
        },
        {
          text: 'Highlighted',
          value: Constants.TextEditor.Prism
        }
      ],
      theme: Constants.Themes.System,
      themes: [
        {
          text: 'System',
          value: Constants.Themes.System
        },
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
      if (event.keyCode === Constants.Keys.escape) {
        this.close();
      }
    },

    /* eslint-disable brace-style */
    load() {
      settings.storageService.get().then(value => { this.storageService = value; });
      settings.autoName.get().then(value => { this.autoName = value; });
      settings.autoSave.get().then(value => { this.autoSave = value; });
      settings.autoSync.get().then(value => { this.autoSync = value; });
      settings.autoFocus.get().then(value => { this.autoFocus = value; });
      settings.name.get().then(name => { this.accountName = name; });
      settings.email.get().then(email => { this.accountEmail = email; });
      settings.textEditor.get().then(editor => { this.textEditor = editor; });
      settings.theme.get().then(theme => { this.theme = theme; });
      settings.foregroundSync.get().then(value => { this.foregroundSync = value; });
    },

    notify(msg) {
      log.info(msg);
      EventBus.instance().emit(Constants.Event.Snackbar, msg);
    },

    close() {
      this.$router.go(-1);
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
      context.remote.accountClear().then(() => {
        this.notify('Logged out');
        this.appReload();
      });
    },

    nukeDatabase() {
      storage.deleteDatabase().then(() => {
        this.notify('Local database deleted');
      });
    },

    authenticate() {
      context.remote.authenticate(window);
    },

    causeRemoteError() {
      context.remote.read('/non-existent-file');
    },

    update(field, value) {
      switch (field) {
        case 'autoFocus':
          settings.autoFocus.set(value).then(() => {
            this.notify(`Autofocus: ${value ? 'on' : 'off'}`);
          });
          break;

        case 'autoName':
          settings.autoName.set(value).then(() => {
            this.notify(`Autoname: ${value ? 'on' : 'off'}`);
          });
          break;

        case 'autoSave':
          settings.autoSave.set(value).then(() => {
            this.notify(`Autosave: ${value ? 'on' : 'off'}`);
          });
          break;

        case 'autoSync':
          settings.autoSync.set(value).then(() => {
            this.notify(`Autosync: ${value ? 'on' : 'off'}`);
            this.appReload();
          });
          break;

        case 'foregroundSync':
          settings.foregroundSync.set(this.foregroundSync).then(() => {
            this.notify(`Foreground sync: ${this.foregroundSync ? 'on' : 'off'}`);
            this.appReload();
          });
          break;

        case 'storageService':
          settings.storageService.set(this.storageService).then(() => {
            if (this.storageService === Constants.StorageServices.None) {
              this.autoSync = false;
              if (context.remote) {
                this.logout();
              }
            }
            this.notify(`Storage service: ${this.storageService}`);
          });
          break;

        case 'textEditor':
          settings.textEditor.set(this.textEditor).then(() => {
            this.notify(`TextEditor: ${this.textEditor}`);
          });
          break;

        case 'theme':
          settings.theme.set(this.theme).then(() => {
            this.appReload();
          });
          break;

        default:
          log.debug(value, event);

      }
    },

    appReload() {
      EventBus.instance().emit(Constants.Event.App.Reload);
    }
  }
};
</script>
