<template>
  <v-speed-dial fixed bottom right transition="scale-transition">
    <template v-slot:activator direction="top">
      <v-btn v-model="show" color="blue darken-2" dark fab>
        <v-icon v-if="show">
          mdi-close
        </v-icon>
        <v-icon v-else>
          mdi-plus
        </v-icon>
      </v-btn>
    </template>

    <v-btn fab small aria-role="listitem" @click="$emit('directory')">
      <v-icon>mdi-folder-plus</v-icon>
    </v-btn>
    <v-btn fab small color="primary" aria-role="listitem" @click="$emit('text')">
      <v-icon>mdi-file-plus</v-icon>
    </v-btn>
    <!-- <b-dropdown-item aria-role="listitem">
      <b-icon class="pr-4" icon="microphone-plus"></b-icon>Audio file
    </b-dropdown-item>
    <b-dropdown-item aria-role="listitem">
      <b-icon class="pr-4" icon="image-plus"></b-icon>Image file
    </b-dropdown-item> -->
  </v-speed-dial>
</template>

<script>
export default {
  name: 'ListNew',

  data() {
    return {
      show: false
    };
  }
};
</script>
