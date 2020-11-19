<template>
  <div class="media" @click="$emit('open', value)">
    <div class="media-left">
      <flash :value="value"></flash>
      <b-icon :icon="icon"></b-icon>
    </div>
    <div class="media-content">
      <div>{{ value.name }}&nbsp;</div>
      <div>{{ description }}&nbsp;</div>
    </div>
    <div class="media-right" v-on:click.stop>
      <b-dropdown v-if="value.path" position="is-bottom-left" aria-role="list">
        <b-icon icon="dots-vertical" slot="trigger"></b-icon>
        <b-dropdown-item aria-role="listitem" @click="$emit('rename', value)">Rename</b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="$emit('move', value)">Move</b-dropdown-item>
        <b-dropdown-item aria-role="listitem" @click="$emit('remove', value)">Delete</b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import { DateTime } from 'luxon';
import Flash from './Flash';

export default {
  name: 'ListEntry',

  components: {
    Flash
  },

  props: {
    /** @type {Metadata} */
    value: Object
  },

  computed: {
    description() {
      const entry = this.value;
      if (entry.tag === 'folder') {
        return '';
      }

      return `${this.size} (${this.modified})`; 
    },

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
        case 'text':
        default:
          return 'text';
      }
    },

    modified() {
      const dt = DateTime.fromISO(this.value.modified);
      return dt.toLocaleString(DateTime.DATETIME_MED);
    },

    size() {
      const entry = this.value;
      const kb = 1 << 10;
      const mb = kb << 10;
      if (entry.size < 0) {
        return '0';
      } else if (entry.size === 1) {
        return '1 Byte';
      } else if (entry.size < kb << 1) {
        return `${entry.size} Bytes`;
      } else if (entry.size < mb << 1) {
        return `${Math.ceil(entry.size / kb)} KB`;
      } else {
        return `${Math.round(100.0 * entry.size / mb) / 100.0} MB`;
      }
    }
  },
};
</script>

<style scoped>
.file-entry {
  height: 3.5rem;
  cursor: pointer;
}
</style>
