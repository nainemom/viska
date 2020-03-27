<template>
<div>
  Server Stat = {{ this.isConnected }} {{ this.server.id }}
</div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      server: undefined,
      isConnected: false, // server status: null=reconnecting, false=disconnected, true=connected
      sid: undefined,
      pid: undefined,
    }
  },
  methods: {

  },
  created() {
    this.server = io.connect(':3002');
    this.server.on('connect', () => {
      this.isConnected = true;
      this.sid = this.server.id;
      this.$emit('connectionStateChange', this.isConnected);
    });
    this.server.on('disconnect', () => {
      this.isConnected = false;
      this.sid = undefined;
      this.$emit('connectionStateChange', this.isConnected);
    });
    this.server.on('reconnecting', () => {
      this.isConnected = null;
      this.$emit('connectionStateChange', this.isConnected);
    });
  }
}
</script>