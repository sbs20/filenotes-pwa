<template>
  <v-menu class="pt-2" offset-y aria-role="list">
    <template v-slot:activator="{ on }">
      <v-icon v-on="on">mdi-sort</v-icon>
    </template>
    <v-list>
      <v-list-item v-for="option in sortOptions" :key="option.key" aria-role="listitem" @click="update(option)">
        {{ option.text }}
      </v-list-item>
    </v-list>
  </v-menu>  
</template>

<script>
import Constants from '@/classes/constants';

const Options = [
  {
    key: Constants.SortBy.FolderThenNameAsc,
    text: 'Folders then Name Ascending'
  },
  {
    key: Constants.SortBy.FolderThenNameDesc,
    text: 'Folders then Name Descending'
  },
  {
    key: Constants.SortBy.NameAsc,
    text: 'Name Ascending'
  },
  {
    key: Constants.SortBy.NameDesc,
    text: 'Name Descending'
  },
  {
    key: Constants.SortBy.ModifiedAsc,
    text: 'Last Modified Ascending'
  },
  {
    key: Constants.SortBy.ModifiedDesc,
    text: 'Last Modified Descending'
  },
  {
    key: Constants.SortBy.SizeAsc,
    text: 'Size Ascending'
  },
  {
    key: Constants.SortBy.SizeDesc,
    text: 'Size Descending'
  }
];

export default {
  name: 'SortOptions',

  props: {
    value: String
  },

  data() {
    return {
      sortOptions: Options
    };
  },

  methods: {
    update(option) {
      this.$emit('input', option.key);
    }
  }
};
</script>