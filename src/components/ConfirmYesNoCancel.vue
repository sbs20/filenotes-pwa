<template>
  <v-dialog v-model="show" aria-role="dialog" max-width="300" v-on:keydown.stop="_onKeys" aria-modal>
    <v-card>
      <v-card-title class="headline">
        {{ message }}
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click.prevent="cancel">Cancel</v-btn>
        <v-btn color="error" text @click.prevent="no">No</v-btn>
        <v-btn color="primary" text @click.prevent="yes">yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmYesNoCancel',
  data() {
    return {
      message: null,
      show: false,
      onYes: null,
      onNo: null,
      onCancel: null,
    };
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === 13) {
        this.ok();
      }
    },

    cancel() {
      this.show = false;
      if (this.onCancel) {
        this.onCancel();
      }
    },

    no() {
      this.show = false;
      if (this.onNo) {
        this.onNo();
      }
    },

    yes() {
      this.show = false;
      if (this.onYes) {
        this.onYes();
      }
    },

    open(options) {
      this.message = options.message;
      this.onYes = options.onYes;
      this.onNo = options.onNo;
      this.onCancel = options.onCancel;
      this.show = true;
    }
  }
};
</script>
