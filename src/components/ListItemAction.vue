<template>
  <v-menu ref="menu" class="pt-2" offset-y aria-role="list">
    <template v-slot:activator="{ on }">
      <v-icon v-on="on">mdi-dots-vertical</v-icon>
    </template>
    <v-list>
      <v-list-item @click="$emit('rename')">Rename</v-list-item>
      <v-list-item @click="$emit('move')">Move</v-list-item>
      <v-list-item @click="$emit('remove')">Remove</v-list-item>
    </v-list>
  </v-menu>  
</template>

<script>
export default {
  name: 'ListItemAction',

  methods: {
    /* eslint-disable no-unused-vars */
    open(event) {
      this.$refs.menu.isActive = true;
    }
  }
};
</script>
