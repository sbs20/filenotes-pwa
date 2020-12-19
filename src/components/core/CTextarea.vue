<script>
const MinHeight = 100;

export default {
  name: 'CTextarea',

  props: {
    autofocus: Boolean,
    value: String,
    scrollfix: Boolean,
    top: {
      type: Number,
      default: 0
    },
  },

  mounted() {
    setTimeout(() => {
      /** @type {HTMLInputElement} */
      const textarea = this.$refs.textarea;
      textarea.setSelectionRange(0, 0);
      if (this.autofocus) {
        textarea.focus();
      }
      this.y = textarea.getBoundingClientRect().top,
      this._updateHeight();
    }, 0);
  },

  data() {
    return {
      caret: {
        top: 0
      },
      scroll: {
        left: 0,
        top: 0
      },
      y: 0,
      text: this.value || ''
    };
  },

  computed: {
    lineCount() {
      return this.text.split(/\r\n|\n/).length;
    },
  },

  watch: {
    value() {
      this.text = this.value || '';
    }
  },

  methods: {
    _scroll() {
      return {
        left: window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft,
        top: window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
      };
    },

    _caret() {
      const textarea = this.$refs.textarea;
      if (textarea) {
        const { value, selectionStart, selectionEnd, offsetHeight } = this.$refs.textarea;
        let line = 0;
        let count = 0;
        for (let index = 0; index < value.length; index++) {
          if (value[index] === '\n') {
            count++;
            if (selectionStart === selectionEnd && index < selectionStart) {
              line++;
            }
          }
        }

        const lineHeight = offsetHeight / count;
        const bound = textarea.getBoundingClientRect();
        const caretY = bound.top + (lineHeight * (line + 1));

        return {
          top: caretY
        };
      }
      return {};
    },

    _onKey(event) {
      // Capture positions on keydown before anything else happens
      this.scroll = this._scroll();
      this.caret = this._caret();

      switch (event.code) {
        default:
          break;
      }

      this._updateHeight();
    },

    _updateHeight() {
      /** @type {HTMLTextAreaElement} */
      const textarea = this.$refs.textarea;
      if (textarea) {
        textarea.style.height = '0';
        textarea.style.height = `${Math.max(MinHeight, textarea.scrollHeight)}px`;
        if (this.scrollfix) {
          const shift = -Math.max(0, this.y - this.caret.top);
          window.scrollTo(this.scroll.left, this.scroll.top + shift);
        }
      }
    },

    update(event) {
      this.$emit('input', event.target.value);
      this._updateHeight();
    }
  },

  render(h) {
    return h('textarea', {
      ref: 'textarea',
      on: {
        input: this.update,
        keydown: this._onKey,
      },

      domProps: {
        value: this.text
      }
    });
  }
};
</script>
