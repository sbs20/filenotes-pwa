<template>
  <b-navbar :fixed-top="true" :shadow="false" :class="menu ? '' : 'nomenu'">
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


<script>
export default {
  name: 'Navigation',

  props: {
    menu: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style>
/**
 * The following CSS overrides the burger / @media queries so that
 * the navbar buttons are always visible.
 */
.nomenu .navbar-menu {
  flex-grow: 1;
  flex-shrink: 0;
  height: 4rem;
  padding: 0.5rem 0;
}

.nomenu.navbar, .nomenu .navbar-menu, .nomenu .navbar-start, .nomenu .navbar-end {
  align-items: stretch;
  display: flex;
}

.nomenu .navbar-item, .nomenu .navbar-link {
  align-items: center;
  display: flex;
  height: 3rem;
}

.nomenu .navbar-end {
  justify-content: flex-end;
  margin-left: auto;
}

.nomenu .navbar-burger {
  display: none;
}

</style>