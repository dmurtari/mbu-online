export default {
  data() {
    return {
      eventLoading: false,
      eventLoadError: ''
    }
  },
  created() {
    this.eventLoading = true;
    Promise.all([
      this.$store.dispatch('getEvents'),
      this.$store.dispatch('getCurrentEvent')
    ])
      .then(() => {
        this.eventLoadError = '';
      })
      .catch(() => {
        this.eventLoadError = 'Failed to fetch event data. Please refresh to try again.';
      })
      .then(() => {
        this.eventLoading = false;
      });
  }
}
