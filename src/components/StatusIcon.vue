<template>
<span :class="[$style.status, value === null ? 'null' : value.toString()]">
  <i v-if="value === null" class="fa fa-spinner fa-pulse" />
</span>
</template>

<script>

export default {
  props: {
    value: {
      default: 'badge',
    }
  },
  style({ className, mediaQuery }) {
    return [
      className('status', {
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        color: '#000',
        '&.true': {
          background: this.$root.theme.onlineColor,
        },
        '&.false': {
          backgroundColor: this.$root.theme.grayColor,
        },
        '&.badge': {
          backgroundColor: this.$root.theme.primaryColor,
        },
        '&.null': {
          backgroundColor: 'transparent',
          color: '#000',
        }
      }),
    ];
  }
}
</script>