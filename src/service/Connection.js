export default {
  data(){
    return {
      status: window.navigator.onLine,
    };
  },
  methods: {
    onStatusChange(newStatus) {
      if (newStatus === true) {
        location.reload();
      }
      this.status = newStatus;
    },
  },
  created() {
    window.addEventListener('online', this.onStatusChange.bind(this, true));
    window.addEventListener('offline', this.onStatusChange.bind(this, false));
  },
}
