<template>
  <v-icon>mdi-{{icon}}</v-icon>
</template>

<script>
import FilePath from '@/classes/files/file-path';

export default {
  name: 'FileIcon',

  props: {
    /** @type {Metadata} */
    value: Object
  },

  computed: {
    icon() {
      const entry = this.value;
      if (entry.tag === 'folder') {
        return 'folder';
      }

      switch (FilePath.create(entry.path).type) {
        case 'audio':
          return 'microphone';
        case 'image':
          return 'image';
        case 'pdf':
          return 'file-pdf';
        case 'todotxt':
          return 'calendar-check';
        case 'text':
        default:
          return 'text';
      }
    }
  }
};
</script>
