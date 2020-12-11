<template>
  <div>
    <div class="float-right"><img src="../../public/img/filenotes-88.png"></div>
    <div class="text-h4">Filenotes</div>
    <v-btn color="primary" @click="authenticate">Authenticate</v-btn>
  </div>
</template>

<script>
import RemoteProvider from '../classes/remote-provider';

export default {
  name: 'Start',

  methods: {
    authenticate() {
      RemoteProvider.instance().authenticate(window);
    }
  }
};
</script>
