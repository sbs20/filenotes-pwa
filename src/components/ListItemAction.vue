<template>
  <b-dropdown class="pt-2" :mobile-modal="true" position="is-bottom-left" aria-role="list">
    <b-icon icon="dots-vertical" slot="trigger"></b-icon>
    <b-dropdown-item aria-role="listitem" @click="$emit('rename')">Rename</b-dropdown-item>
    <b-dropdown-item aria-role="listitem" @click="$emit('move')">Move</b-dropdown-item>
    <b-dropdown-item aria-role="listitem" @click="$emit('remove')">Delete</b-dropdown-item>
  </b-dropdown>  
</template>

<script>
export default {
  name: 'ListItemAction'
};
</script>
