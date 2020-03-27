<template>
<form @submit.prevent="submit" :class="$style.container">
  <input :class="$style.messageInput" placeholder="Enter Your Message..." :value="value" @input="$emit('input', $event.target.value)" required :disabled="disabled"/>
  <button :class="$style.submitButton" type="submit" :disabled="disabled"> Send </button>
</form>
</template>

<script>

export default {
  props: {
    value: {
      type: String,
    },
    disabled: {
      type: Boolean,
    }
  },
  methods: {
    submit() {
      this.$emit('submit', this.value);
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('container', {
        display: 'flex',
        flexDirection: 'row',
      }),
      className('messageInput', {
        flexGrow: 1,
        marginRight: '8px',
        borderRadius: '8px',
        border: `solid 1px ${this.$root.theme.borderColor}`,
        padding: '8px',
        height: '48px',
        '&[disabled]': {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      }),
      className('submitButton', {
        borderRadius: '8px',
        backgroundColor: this.$root.theme.primaryColor,
        color: this.$root.theme.fillColor,
        padding: '8px',
        fontWeight: 'bold',
        border: `solid 1px ${this.$root.theme.borderColor}`,
        cursor: 'pointer',
        height: '48px',
        '&[disabled]': {
          opacity: 0.6,
          cursor: 'not-allowed',
        },
      }),
    ];
  }
}
</script>