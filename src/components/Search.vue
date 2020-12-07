<template>
  <div>
    <navigation>
      <template v-slot:header>
        Search
      </template>
      <template v-slot:end>
        <b-navbar-item tag="a" @click="close"><b-icon icon="close"></b-icon></b-navbar-item>
      </template>
    </navigation>

    <div class="block">
      <b-field>
        <b-input ref="queryInput" v-model="query" placeholder="Search..."></b-input>
      </b-field>
      <span v-if="query">
        Showing {{ results.length }} results for '{{ query }}'
      </span>
    </div>

    <div class="block">
    </div>

    <div class="list-item" tabindex="1" v-for="entry in results" v-bind:key="entry.key">
      <list-item :value="entry" @open="open" :show-actions="false"></list-item>
    </div>
  </div>
  
</template>

<script>
import LocalProvider from '../classes/local-provider';
import Logger from '../classes/logger';
import MetadataComparator from '../classes/metadata-comparator';
import Settings from '../classes/settings';

import ListItem from './ListItem';
import Navigation from './Navigation';

const log = Logger.get('List');
const fs = LocalProvider.instance();
const settings = Settings.instance();

export default {
  name: 'Search',
  components: {
    ListItem,
    Navigation,
  },

  created() {
    document.addEventListener('keydown', this._onKeys);
    this.search();
  },

  mounted() {
    this.$refs.queryInput.focus();
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
      if (event.keyCode === 27) {
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
