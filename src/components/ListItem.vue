<template>
  <div class="media" @click="$emit('open', value)">
    <div class="media-left">
      <flash :value="value"></flash>
      <b-icon class="pt-3" :icon="icon"></b-icon>
    </div>
    <div class="media-content">
      <div class="is-size-5">{{ value.name }}&nbsp;</div>
      <div class="is-size-7">{{ description }}&nbsp;</div>
    </div>
    <div class="media-right" v-on:click.stop>
      <list-item-action v-if="showAction"
        @rename="$emit('rename', value)"
        @remove="$emit('remove', value)"
        @move="$emit('move', value)"></list-item-action>
    </div>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import { DateTime } from 'luxon';
import Flash from './Flash';
import ListItemAction from './ListItemAction';
import Constants from '../classes/constants';

export default {
  name: 'ListItem',

  components: {
    Flash,
    ListItemAction
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
    },

    showAction() {
      return this.value.name !== Constants.ParentDirectory;
    }
  },
};
</script>
