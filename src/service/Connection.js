export default {
  data(){
    return {
      status: window.navigator.onLine,
    };
  },
  methods: {
    onStatusChange() {
      window.location.reload();
    },
  },
  created() {
    window.addEventListener('online', this.onStatusChange);
    window.addEventListener('offline', this.onStatusChange);
  },
}
