<template>
  <div class="is-relative">
    <div v-if="current">
      <h2>Location: {{ current.path || "/" }}</h2>
    </div>

    <div class="mt-3" v-for="entry in entries" v-bind:key="entry.key">
      <div class="media" @click="open(entry)" style="cursor: pointer;">
        <div class="media-left">
          <b-icon icon="folder"></b-icon>
        </div>
        <div class="media-content">
          <div>{{ entry.name }}&nbsp;</div>
        </div>
      </div>
    </div>
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
      LocalProvider.instance().get(entry.path).then(current => {
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

        LocalProvider.instance().list(current).then(entries => {
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
