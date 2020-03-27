<template>
<div id="root">
  Server Stat = {{ this.$root.isConnected }} {{ this.$root.server.id }};
  <router-link to="/chats">Chats</router-link>
  <hr />
  <router-view></router-view>
</div>
</template>

<script>
export default {}
</script>