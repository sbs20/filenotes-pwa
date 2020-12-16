<template>
  <c-textarea v-model="text" :top="90" spellcheck="false" scrollfix class="plain-editor" @input="update"></c-textarea>
</template>

<script>
import CTextarea from '../core/CTextarea.vue';

export default {
  components: { CTextarea },
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
  font-weight: 100;
  line-height: 1.75rem;
  outline: 0;
  width: 100%;
}

</style>
