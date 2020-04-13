<template>
  <div :class="$style.container" v-if="$connection.status === false">
      <div>
        <h2> Waiting for Network... </h2>
      </div>
  </div>
</template>

<script>
export default {
  style({ className }) {
    return [
      className('container', {
        position: 'fixed',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
      }),
    ]
  }
}
</script>