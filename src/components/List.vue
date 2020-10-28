<template>
  <div>
    <div v-for="file in files" v-bind:key="file.key">
      <div>{{ file.tag }}</div>
      <div><router-link :to="'/f/' + file.key">{{ file.key }}</router-link></div>
      <div>{{ file.size }}</div>
      <div>{{ file.modified }}</div>
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
      files: [],
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
      this.files = []
      this.data = null;
      Context.local.get(this.$route.params.pathMatch).then(current => {
        if (current === undefined) {
          current = {
            tag: 'folder',
            key: ''
          }
        }

        this.current = current;

        if (current.tag === 'folder') {
          Context.local.list().then(files => {
            this.files = files.filter(metadata => {
              const key = metadata.key;
              return key.startsWith(current.key) && key.indexOf('/', current.key.length + 2) === -1;
            });
          });
        } else if (current.tag === 'file') {
          Context.local.read(current.key).then(buffer => {
            this.data = Convert.arrayBufferToString(buffer);
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
