<template>
  <div>
    <div v-if="current" class="text-h4">Location: {{ current.path || "/" }}</div>
    <v-row v-for="entry in entries" v-bind:key="entry.key" @click="open(entry)" style="cursor: pointer;">
      <v-col>
        <v-icon class="float-left">mdi-folder</v-icon>
        <div class="ml-3 float-left">{{ entry.name }}&nbsp;</div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import FilePath from '../classes/files/file-path';
import FileBuilder from '../classes/files/file-builder';
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
    this.open(FileBuilder.folder(this.value));
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
            const parent = FileBuilder.folder(FilePath.create(current.path).directory);
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
