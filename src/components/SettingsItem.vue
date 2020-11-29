<template>
  <div class="columns is-mobile">
    <div class="column is-9">
      <div class="pt-2"><slot name="description"></slot></div>
    </div>
    <div class="column is-3">
      <slot name="action"></slot>
    </div>
  </div>
</template>