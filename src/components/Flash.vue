<template>
  <div class="flash" :style="{ backgroundColor: colour }"></div>
</template>

<script>
const COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
  '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
  '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
];

export default {
  name: 'Flash',

  props: {
    value: String
  },

  computed: {
    colour() {
      /** @type {string} */
      const name = this.value || '';
      const sum = Array.from(name).reduce((acc, char) => {
        acc += char.charCodeAt(0);
        return acc;
      }, 0);
      const index = sum % COLORS.length;
      return COLORS[index];
    },
  },
};
</script>

<style scoped>
.flash {
  width: 0.25rem;
  min-height: 3rem;
  margin-right: 0.75em;
}
</style>
