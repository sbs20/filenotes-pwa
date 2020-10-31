<template>
  <div>
    <div v-for="entry in entries" v-bind:key="entry.key">
      <div>{{ entry.tag }}</div>
      <div><router-link :to="'/f/' + entry.key">{{ entry.key }}</router-link></div>
      <div>{{ entry.size }}</div>
      <div>{{ entry.modified }}</div>
    </div>
    <div v-if="data">
      <input type="button" value="back" @click="$router.go(-1)">
      <input type="button" value="save" @click="save">
      <textarea v-model="data"></textarea>
    </div>
    <input type="button" value="refresh list" @click="refresh">
  </div>
</template>

<script>
import Context from '../js/context';
import Convert from '../js/convert';
import Log from '../js/log';

const log = Log.get('List');

export default {
  name: 'List',

  data() {
    this.refresh();
    return {
      /** @type {Metadata} */
      current: null,

      /** @type {Array.<Metadata>} */
      entries: [],

      data: null
    };
  },

  watch: {
    $route() {
      this.refresh();
    }
  },

  methods: {
    refresh() {
      this.entries = []
      this.data = null;
      Context.local.get(this.$route.params.pathMatch).then(current => {
        this.current = current || {
          tag: 'folder',
          key: ''
        };

        if (this.current.tag === 'folder') {
          Context.local.list().then(entries => {
            this.entries = entries.filter(metadata => {
              const key = metadata.key;
              return key.startsWith(this.current.key) && key.indexOf('/', this.current.key.length + 1) === -1;
            });
          });
        } else if (this.current.tag === 'file') {
          Context.local.read(this.current.key).then(buffer => {
            console.log('Stored', this.current.hash);
            Context.remote.hash(buffer).then(hash => {
              console.log('Calc', hash);
            });
            this.data = `{${this.current.name}}`;
            if (this.current.name.endsWith('.txt')) {
              this.data = Convert.arrayBufferToString(buffer);
            }
          })
        }
      });
    },
  
    save() {
      const buffer = Convert.stringToArrayBuffer(this.data);
      Context.local.write(this.current.path, buffer);
      log.debug('Save', this.current);
    }
  }
}
</script>

<style scoped>
</style>
