<template>
  <v-dialog v-model="show" aria-role="dialog" aria-modal>
    <v-card>
      <v-card-title class="headline">
        Install
      </v-card-title>
      <v-card-text>
        Do you want to install Filenotes?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click.prevent="Install">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
let installEvent;
export default {
  name: 'Install',

  data() {
    return {
      show: false
    };
  },

  created() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      installEvent = e;
      this.show = true;
    });
  },
  
  methods: {
    install() {
      this.show = false;
      installEvent.prompt();
      installEvent.userChoice.then(() => {
        installEvent = null;
      });
    }
  }
};
</script>