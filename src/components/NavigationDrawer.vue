<template>
  <div>
    <v-app-bar color="accent-4 elevation-0" app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Filenotes</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="$router.push('/search')">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer class="elevation-0" v-model="drawer" app temporary>
      <v-app-bar color="accent-4 elevation-0">
        <v-btn icon href="/">
          <v-img contain max-width="36" max-height="36" src="../../public/img/filenotes-88.png" alt="Filenotes" />
        </v-btn>
        <v-toolbar-title>Filenotes</v-toolbar-title>
      </v-app-bar>
      <v-list nav>
        <v-list-item @click="$router.push('/list')">
          <v-list-item-icon><v-icon>mdi-file-document-multiple</v-icon></v-list-item-icon>
          <v-list-item-title>Files</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/console')">
          <v-list-item-icon><v-icon>mdi-console</v-icon></v-list-item-icon>
          <v-list-item-title>Console</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$emit('sync-force')">
          <v-list-item-icon><v-icon>mdi-sync</v-icon></v-list-item-icon>
          <v-list-item-title>Force Sync</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item @click="$router.push('/settings')">
          <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>

        <v-list-item @click="$router.push('/about')">
          <v-list-item-icon><v-icon>mdi-information</v-icon></v-list-item-icon>
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>  
</template>

<script>
export default {
  name: 'NavigationDrawer',

  data: () => ({
    drawer: false,
  }),
};
</script>

<style>

</style>