<template>
  <b-modal :active.sync="show" has-modal-card trap-focus
    :destroy-on-hide="true" aria-role="dialog" aria-modal>
    <div class="modal-card">
      <header class="modal-card-head">Install</header>
      <section class="modal-card-body">
        Do you want to install Filenotes?
      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" @click.prevent="install">Yes</button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
let installEvent;
export default {
  name: 'Install',

  data() {
    return {
      show: false
    };
  },

  created() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      installEvent = e;
      this.show = true;
    });
  },
  
  methods: {
    install() {
      this.show = false;
      installEvent.prompt();
      installEvent.userChoice.then(() => {
        installEvent = null;
      });
    }
  }
};
</script>