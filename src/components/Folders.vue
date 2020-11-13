<template>
  <div class="md-layout" style="position: relative;">
    <div v-if="current">
      <h2>Location: {{ current.path || "/" }}</h2>
    </div>

    <md-list class="md-double-line">
      <div v-for="entry in entries" v-bind:key="entry.key">
        <md-list-item @click="open(entry)">
          <md-icon>folder</md-icon>
          <div class="md-list-item-text">
            <span>{{ entry.name }}</span>
          </div>
        </md-list-item>
      </div>
    </md-list>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import FolderMetadata from '../classes/files/folder-metadata';
import LocalProvider from '../classes/local-provider';

export default {
  name: 'Folders',

  props: {
    value: String
  },

  data() {
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],
    };
  },

  created() {
    this.open(FolderMetadata.create(this.value));
  },

  methods: {
    /**
     * @param {Metadata} entry
     */
    open(entry) {
      /** @type {string} */
      LocalProvider.get(entry.path).then(current => {
        current = current || {
          tag: 'folder',
          key: '',
          path: '',
          name: '../ (parent)'
        };

        this.current = entry;
        this.$emit('input', entry.path);

        if (current.tag === 'file') {
          return;
        }

        LocalProvider.list(current).then(entries => {
          if (current.key !== '') {
            const parent = FolderMetadata.create(FilePath.create(current.path).directory);
            parent.name = '../ (parent)';
            entries.splice(0, 0, parent);
          }
          this.entries = entries.filter(m => m.tag === 'folder');
        });
      });
    },
  }
};
</script>

<style scoped>
.md-list {
  width: 100%;
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  border: 1px solid rgba(#000, .12);
}
</style>
