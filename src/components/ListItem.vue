<template>
  <div class="list-item" @click="$emit('open', value)">
    <div class="float-left">
      <flash v-model="value.key"></flash>
      <file-icon :value="value"></file-icon>
    </div>
    <div class="float-left pl-2">
      <div class="text-h6">{{ value.name }}&nbsp;</div>
      <div class="text-caption">
        <span v-if="value.tag === 'file'">
          <file-size v-model="value.size"></file-size> (<date-time v-model="value.modified"></date-time>)
        </span>&nbsp;
      </div>
    </div>
    <div class="float-right" v-on:click.stop>
      <list-item-action v-if="actions"
        @rename="$emit('rename', value)"
        @remove="$emit('remove', value)"
        @move="$emit('move', value)"></list-item-action>
    </div>
  </div>
</template>

<script>
import DateTime from './DateTime';
import FileIcon from './FileIcon';
import FileSize from './FileSize';
import Flash from './Flash';
import ListItemAction from './ListItemAction';
import Constants from '../classes/constants';

export default {
  name: 'ListItem',

  components: {
    DateTime,
    FileIcon,
    FileSize,
    Flash,
    ListItemAction
  },

  props: {
    /** @type {Metadata} */
    value: Object,

    showActions: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    actions() {
      return this.showActions && this.value.name !== Constants.ParentDirectory;
    }
  },
};
</script>

<style scoped>
.list-item {
  min-height: 3.5rem;
  padding: 0 0.5rem 0 0.5rem;
  cursor: pointer;
}
</style>