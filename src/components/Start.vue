<template>
  <div>
    <navigation>
      <template v-slot:header>Start</template>
      <template v-slot:end>
      </template>
    </navigation>
    <div class="box">
      <div class="title is-4">Filenotes</div>
      <div class="block">
        Welcome to Filenotes.
      </div>
      <button class="button is-primary" @click="authenticate">Authenticate</button>
    </div>
  </div>
</template>

<script>
import RemoteProvider from '../classes/remote-provider';
import Navigation from './Navigation';

export default {
  name: 'Start',
  components: {
    Navigation
  },

  methods: {
    authenticate() {
      RemoteProvider.instance().authenticate(window);
    }
  }
};
</script>
