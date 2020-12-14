<template>
  <div>
    <v-text-field autofocus v-model="query" placeholder="Search..."></v-text-field>

    <div class="list-item" tabindex="1" v-for="entry in results" v-bind:key="entry.key">
      <list-item :value="entry" @open="open" :show-actions="false"></list-item>
    </div>
  </div>
  
</template>

<script>
import Constants from '../classes/constants';
import LocalProvider from '../classes/local-provider';
import Logger from '../classes/logger';
import MetadataComparator from '../classes/metadata-comparator';
import Settings from '../classes/settings';

import ListItem from './ListItem';

const log = Logger.get('List');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'Search',
  components: {
    ListItem,
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    this.search();
  },

  data() {
    return {
      query: this.$route.params.query,
      results: [],
      timer: 0
    };
  },

  destroyed() {
    document.removeEventListener('keydown', this._onKeys);
  },

  watch: {
    $route() {
      this.query = this.$route.params.query;
      this.search();
    },

    query() {
      clearTimeout(this.timer);
      if (this.query) {
        this.timer = setTimeout(() => {
          this.$router.push(`/search/${this.query}`);
        }, 500);
      }
    }
  },

  methods: {
    _onKeys(event) {
      if (event.keyCode === Constants.Keys.escape) {
        this.close();
      }
    },

    close() {
      this.$router.go(-1);
    },

    search() {
      const query = this.query;
      if (query) {
        log.debug(`Search: ${query}`);
        fs.search(query).then(metadatas => {
          settings.sortBy.get().then(sortBy => {
            /** @type {function(Metadata, Metadata):number} */
            const sorter = MetadataComparator.get(sortBy);
            metadatas.sort(sorter);
            this.results = metadatas;
          });
        });
      } else {
        this.results = [];
      }
    },

    /**
     * @param {Metadata} entry
     */
    open(entry) {
      if (entry.key !== this.$route.params.pathMatch) {
        const base = entry.tag === 'folder' ? '/list' : '/file';
        const path = `${base}${entry.key}`;
        this.$router.push(path);
      }
    },
  }
};
</script>
