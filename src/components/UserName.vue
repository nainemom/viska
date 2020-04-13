<template>
  <div :class="$style.userName" v-if="user" :title="user.type">
    <span class="type">
      {{ user.type === 'persist' ? '@' : '' }}{{ user.type === 'temporary' ? '!' : '' }}
    </span>
    <span class="username">{{ user.username }}</span>
  </div>
</template>

<script>

export default {
  props: {
    user: {
      type: Object,
    },
  },
  style({ className }) {
    return [
      className('userName', {
        display: 'inline-flex',
        overflow: 'hidden',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }),
    ];
  },
}
</script>