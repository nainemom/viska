<template>
  <div :class="[$style.userName, user.type]" v-if="user" :title="user.type">
    <span class="type">
      <i v-if="user.type === 'persist'" class="fa fa-user" />
      <i v-else-if="user.type === 'temporary'" class="fa fa-robot" />
    </span>
    <span class="username">{{ username }}</span>
  </div>
</template>

<script>

export default {
  props: {
    user: {
      type: Object,
    },
  },
  computed: {
    username() {
      return this.user.username && this.user.username[this.user.type === 'temporary' ? 'toLowerCase' : 'toUpperCase']()
    }
  },
  style({ className }) {
    return [
      className('userName', {
        display: 'inline-flex',
        overflow: 'hidden',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        '&.temporary': {
          opacity: 0.9,
        },
        '& .type': {
          marginRight: '8px',
          display: 'inline-block',
        }
      }),
    ];
  },
}
</script>
