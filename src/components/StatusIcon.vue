<template>
<span :class="[$style.status, value ? 'online' : 'offline', value === null && 'loading']">
  <i v-if="value === null" class="fa fa-spinner fa-pulse" />
</span>
</template>

<script>

export default {
  props: {
    value: {
      validator: (v) => [true, false, null].includes(v),
      default: false,
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
        '&.online': {
          background: this.$root.theme.onlineColor,
        },
        '&.offline': {
          backgroundColor: this.$root.theme.grayColor,
        },
        '&.loading': {
          backgroundColor: 'transparent',
          color: '#000',
        }
      }),
    ];
  }
}
</script>