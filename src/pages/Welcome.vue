<template>
<div>
  <h2>
  Welcome!
  </h2>
  Server Stat: {{ this.$root.connecionState }} <br />
  SID: {{ this.$root.sid }} <br />
  PID: {{ this.$root.pid }} <br />
  <router-link to="/chats">Chats</router-link>
  <hr />
  
  <router-link to="/chats">My Chats</router-link>
</div>
</template>

<script>

export default {}
</script>