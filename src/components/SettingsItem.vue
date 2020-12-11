<template>
  <v-row>
    <v-col cols="9">
      <div class="pt-2"><slot name="description"></slot></div>
    </v-col>
    <v-col cols="3">
      <slot name="action"></slot>
    </v-col>
  </v-row>
</template>