<template>
  <div>
    <h3 class="title is-3">Troop Administration</h3>
    <h5 class="subtitle is-5">
      From here, you can access all of the functionality that you will need to register
      scouts and view records for Merit Badge University events.
    </h5>
    <closable-error v-if="eventLoadError"></closable-error>
    <spinner-page v-if="eventLoading"></spinner-page>
    <div v-else
         class="columns">
      <div class="column is-narrow sidebar">
        <aside class="menu">
          <p class="menu-label">Navigation</p>
          <ul class="menu-list">
            <router-link to="/coordinator/home">Home</router-link>
          </ul>
          <p class="menu-label">Pick a task</p>
          <ul class="menu-list">
            <router-link to="/coordinator/scouts">Your Scouts</router-link>
            <router-link to="/coordinator/registrations">Event Registrations</router-link>
            <router-link to="/coordinator/attendance">Attendance Information</router-link>
          </ul>
        </aside>
      </div>
      <div class="column auto">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import EventsUpdate from 'mixins/EventsUpdate';

export default {
  mixins: [
    EventsUpdate
  ]
}
</script>

<style lang="scss" scoped>
.sidebar {
  padding-right: 2rem;
  min-width: 17rem;
}

.subtitle {
  padding-top: 1rem;
}
</style>
