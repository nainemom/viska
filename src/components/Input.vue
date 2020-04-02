<template>
<input :class="$style.input" :value="value" @input="$emit('input', $event.target.value)" />
</template>

<script>

export default {
  props: {
    value: {
      type: String,
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('input', {
        borderRadius: '8px',
        border: `solid 2px ${this.$root.theme.borderColor}`,
        padding: '8px',
        height: '48px',
        fontSize: '1em',
        display: 'block',
        width: '100%',
        '&[disabled]': {
          background: '#fff',
          cursor: 'not-allowed',
        },
        '&:focus': {
          outline: 'none',
          border: `solid 2px ${this.$root.theme.primaryColor}`,
        },
      }),
    ];
  }
}
</script>