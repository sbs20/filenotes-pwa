<template>
  <span>{{ modified }}</span>
</template>

<script>
import { DateTime } from 'luxon';

export default {
  name: 'DateTime',

  props: {
    /** @type {ISODateString} */
    value: String
  },

  computed: {
    modified() {
      const dt = DateTime.fromISO(this.value);
      return dt.toLocaleString(DateTime.DATETIME_MED);
    },
  },
};
</script>