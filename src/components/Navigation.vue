<template>
  <div>
    <v-app-bar color="accent-4 elevation-0" app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="unselectable">Filenotes</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="$router.push('/search')">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer class="elevation-0" v-model="drawer" app temporary>
      <v-app-bar color="accent-4 elevation-0">
        <v-btn icon @click="reload">
          <v-img contain max-width="36" max-height="36" src="../../public/img/filenotes-88.png" alt="Filenotes" />
        </v-btn>
        <v-toolbar-title class="unselectable">Filenotes</v-toolbar-title>
      </v-app-bar>

      <v-list nav>
        <div v-if="email">
          <v-list-item>
            <v-list-item-avatar><v-img class="rounded-lg" contain :src="avatar"></v-img></v-list-item-avatar>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ name }}</v-list-item-title>
              <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </div>

        <v-list-item @click="$router.push('/list')">
          <v-list-item-icon><v-icon>mdi-file-document-multiple</v-icon></v-list-item-icon>
          <v-list-item-title>Files</v-list-item-title>
        </v-list-item>
    
        <v-list-item @click="$emit('sync-force')" v-if="showSync">
          <v-list-item-icon><v-icon>mdi-sync</v-icon></v-list-item-icon>
          <v-list-item-title>Sync</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="$router.push('/settings')">
          <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/console')">
          <v-list-item-icon><v-icon>mdi-console</v-icon></v-list-item-icon>
          <v-list-item-title>Console</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/about')">
          <v-list-item-icon><v-icon>mdi-information</v-icon></v-list-item-icon>
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item>
          <v-list-item-icon><v-icon>mdi-tools</v-icon></v-list-item-icon>
          <v-list-item-title class="unselectable">Version {{version}}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="d-flex flex-row pa-4 text-caption">
          <div class="ml-auto">
            &copy; 2020 Sam Strachan
          </div>
        </div>
      </template>

    </v-navigation-drawer>
  </div>  
</template>

<script>
import Constants from '../classes/constants';
import Settings from '../classes/settings';

const settings = Settings.instance();

export default {
  name: 'Navigation',

  data() {
    settings.name.get().then(value => {
      this.name = value;
    });
    settings.email.get().then(value => {
      this.email = value;
    });
    settings.avatar.get().then(value => {
      this.avatar = value;
    });
    settings.storageService.get().then(service => {
      this.showSync = service !== Constants.StorageServices.None;
    });
    return {
      drawer: false,
      avatar: null,
      email: null,
      name: null,
      showSync: true,
      version: Constants.Version
    };
  },

  methods: {
    reload() {
      window.location.href = `?z=${Date.now()}`;
    }
  }
};
</script>

<style>
.unselectable {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>