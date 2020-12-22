<template>
  <div class="list-item d-flex flex-row" tabindex="1" @click="$emit('open', value)" @contextmenu="onContext">
    <div class="pt-1">
      <flash v-model="value.key"></flash>
    </div>
    <div>
      <file-icon class="pt-2" :value="value"></file-icon>
    </div>
    <div class="pl-2">
      <div class="text-h6">{{ value.name }}&nbsp;</div>
      <div class="text-caption">
        <span v-if="value.tag === 'file'">
          <file-size v-model="value.size"></file-size> (<date-time v-model="value.modified"></date-time>)
        </span>
        <span v-else>
          Folder
        </span>
      </div>
    </div>
    <div class="ml-auto pt-2" v-on:click.stop>
      <list-item-action v-if="actions" ref="actions"
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

  methods: {
    onContext(event) {
      event.preventDefault();
      this.$refs.actions.open(event);
    }
  }
};
</script>

<style scoped>
.list-item {
  min-height: 3.5rem;
  cursor: pointer;
}

/* Tab index */
.list-item:focus {
  outline: 1px rgba(128, 128, 128, 0.2) solid;
  background-color: rgba(128, 128, 128, 0.1);
}

</style>