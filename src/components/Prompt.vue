<template>
  <v-dialog v-model="show" aria-role="dialog" max-width="300" v-on:keydown.stop="_onKeys" aria-modal>
    <v-card>
      <v-card-title class="headline">
        {{ message }}
      </v-card-title>
      <v-card-text>
        <v-text-field :rules="[rules.required]" autofocus ref="field" v-model="value"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click.prevent="cancel">Cancel</v-btn>
        <v-btn text @click.prevent="ok">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Constants from '../classes/constants';
export default {
  name: 'Prompt',
  data() {
    return {
      message: null,
      value: '',
      rules: {
        required: value => !!value || 'Required'
      },
      show: false,
      onCancel: null,
      onConfirm: null,
    };
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.enter) {
        this.ok();
      }
    },

    cancel() {
      this.show = false;
      if (this.onCancel) {
        this.onCancel();
      }
    },

    ok() {
      if (!this.value) {
        return;
      }
      this.show = false;
      if (this.onConfirm) {
        this.onConfirm(this.value);
      }
    },

    open(options) {
      this.message = options.message;
      this.onConfirm = options.onConfirm;
      this.value = options.value;
      this.show = true;
    }
  }
};
</script>
