<template>
  <span>{{ size }}</span>
</template>

<script>
export default {
  name: 'FileSize',

  props: {
    value: Number
  },

  computed: {
    size() {
      const size = this.value;
      const kb = 1 << 10;
      const mb = kb << 10;
      if (size < 0) {
        return '0';
      } else if (size === 1) {
        return '1 Byte';
      } else if (size < kb << 1) {
        return `${size} Bytes`;
      } else if (size < mb << 1) {
        return `${Math.ceil(size / kb)} KB`;
      } else {
        return `${Math.round(100.0 * size / mb) / 100.0} MB`;
      }
    },
  },
};
</script>
