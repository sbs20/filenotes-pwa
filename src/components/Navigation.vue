<template>
  <b-navbar :fixed-top="true" :shadow="false">
    <template v-slot:brand>
      <b-navbar-item tag="a" href="/">
        <img src="../../public/img/filenotes-88.png" alt="Filenotes">
      </b-navbar-item>
      <b-navbar-item tag="div" class="has-text-weight-bold is-size-4">
        <slot name="header">Filenotes</slot>
      </b-navbar-item>
    </template>
    <template v-slot:start>
      <div></div>
    </template>
    <template v-slot:end>
      <slot name="end">
      </slot>
    </template>
  </b-navbar>
</template>

<style scoped>
/* .navigation-header {
  padding-top: 1.5rem;
} */
</style>