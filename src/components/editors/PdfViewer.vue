<template>
  <div>
    <vue-pdf :src="src"
      v-for="index in pageCount"
      :key="index"
      :page="index" class="mt-4" />
  </div>
</template>

<script>
import Convert from '@/classes/utils/convert';
import VuePdf from 'vue-pdf';

export default {
  name: 'PdfViewer',

  components: {
    VuePdf
  },

  props: {
    /** @type {Buffer} */
    value: Buffer,
  },

  created() {
    this.load();
  },

  data() {
    return {
      pageCount: 0,
      src: null,
      url: null,
    };
  },

  watch: {
    value() {
      this.load();
    }
  },

  destroyed() {
    this.release();
  },

  methods: {
    load() {
      this.release();
      if (this.value) {
        const blob = Convert.arrayBufferToBlob(this.value);
        this.url = window.URL.createObjectURL(blob);
        this.src = VuePdf.createLoadingTask(this.url);
        this.src.promise.then(pdf => {
          this.pageCount = pdf.numPages;
        });
      }
    },

    release() {
      if (this.src) {
        URL.revokeObjectURL(this.url);
      }
    }
  }
};

</script>