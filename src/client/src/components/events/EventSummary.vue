<template>
  <div>
    <closable-error v-if="eventLoadError"
                    @dismissError="dismissErrors()"></closable-error>
    <spinner-page v-if="eventLoading"></spinner-page>
    <div v-else>
      <event-detail :event="currentEvent"></event-detail>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import EventDetail from './Detail.vue';

import EventsUpdate from 'mixins/EventsUpdate';

export default {
  computed: {
    ...mapGetters([
      'currentEvent',
    ])
  },
  methods: {
    dismissErrors () {
      this.eventLoadError = '';
    }
  },
  mixins: [
    EventsUpdate
  ],
  components: {
    EventDetail
  }
}
</script>

<style lang="scss" scoped>

</style>

