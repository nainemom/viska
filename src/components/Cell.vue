<template>
<div :class="$style.cell">
  <slot />
</div>
</template>

<script>
export default {
  style({ className }) {
    return [
      className('cell', {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // padding: '0 8px',
        overflow: 'hidden',
        '& > .item': {
          // margin: '0 8px',
        },
        '& > .grow': {
          flexGrow: 1,
        },
      }),
    ];
  }
}
</script>