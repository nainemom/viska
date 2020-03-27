<template>
<div id="root">
  Server Stat: {{ this.$root.connecionState }} <br />
  SID: {{ this.$root.sid }} <br />
  PID: {{ this.$root.pid }} <br />
  <router-link to="/chats">Chats</router-link>
  <hr />
  <router-view></router-view>
</div>
</template>

<script>
export default {}
</script>