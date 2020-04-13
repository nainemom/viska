<template>
<button :class="[$style.button, color, fullWidth && 'full-width', fab && 'fab']">
  <div v-if="loading">
    <i class="fa fa-spinner fa-pulse" />
  </div>
  <slot v-else/>
</button>
</template>

<script>

export default {
  props: {
    color: {
      type: String,
      default: 'default',
    },
    loading: {
      type: Boolean,
      default: false
    },
    fab: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
  },
  style({ className, mediaQuery }) {
    return [
      className('button', {
        display: 'inline-block',
        // borderRadius: '8px',
        // minHeight: '48px',
        border: `solid 2px ${this.$root.theme.borderColor}`,
        // border: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        // padding: '0 16px',
        // lineHeight: 1.6,
        // fontSize: '16px',
        fontWeight: 'bold',
        width: 'auto',
        '&:focus': {
          outline: 'none',
          border: `solid 2px ${this.$root.theme.primaryColor}`,
          color: this.$root.theme.primaryColor,
        },
        '&.full-width': {
          width: '100%',
        },
        '&.primary': {
          background: this.$root.theme.primaryColor,
          borderColor: this.$root.theme.primaryColor,
          color: '#fff',
        },
        '&.danger': {
          background: this.$root.theme.dangerColor,
          color: '#fff',
        },
        '&.text-danger': {
          background: 'transparent',
          color: this.$root.theme.dangerColor,
          border: 'none',
        },
        '&.transparent': {
          background: 'transparent',
          color: 'inherit',
          border: 'none',
        },
        '&.light': {
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'inherit',
          border: 'none',
        },
        '&.dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          color: 'inherit',
          border: 'none',
        },
        '&.default': {
          background: this.$root.theme.backgroundColor,
          color: 'inherit',
        },
        '&[disabled]': {
          cursor: 'not-allowed',
          opacity: 0.6,
        },
      }),
    ];
  }
}
</script>