<template>
  <div v-if="text !== null">
    <v-textarea autofocus auto-grow ref="textarea" class="plain-editor" v-model="text" @input="update"></v-textarea>
  </div>
</template>

<script>

export default {
  name: 'PlainTextEditor',

  props: {
    /** @type {Buffer} */
    value: Buffer,
  },

  created() {
    this.load();
  },

  data() {
    return {
      /** @type {string} */
      text: null
    };
  },

  watch: {
    value() {
      this.load();
    }
  },

  methods: {
    load() {
      if (this.value) {
        this.text = this.value.toString();
      }
    },

    update() {
      this.$emit('input', Buffer.from(this.text));
    }
  }
};
</script>

<style scoped>
.plain-editor {
  font-family: Cascadia Code, Courier, monospace;
  font-size: 1rem;
  line-height: 1.75rem;
  width: 100%;
  font-weight: 100;
}

</style>
