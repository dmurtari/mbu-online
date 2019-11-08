<template>
  <div>
    <section class="section">
      <div class="container">
        <h1 class="title is-1">Welcome to MBU Online</h1>
        <h3 class="subtitle is-3">
          <span v-if="isAdmin" id="adminWelcome">Get started on the
            <router-link to="/administration">Administration</router-link>
            page.
          </span>
          <span v-else-if="isTeacher" id="teacherWelcome">Get started using the
            <router-link to="/teacher">Teacher</router-link>
            page.
          </span>
          <span v-else-if="isCoordinator" id="coordinatorWelcome">Get started using the
            <router-link to="/coordinator">Manage Troop</router-link>
            page.
          </span>
          <span v-else id="genericWelcome">
            <router-link to="/login">Login</router-link>
            or
            <router-link to="/signup">signup</router-link>
            to get started
          </span>
        </h3>
      </div>
    </section>
    <closable-error v-if="error"></closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <section class="section" v-else>
      <div v-if="currentEvent.id">
        <h4 class="title is-4">
          Latest Event Information
          <span
            v-if="currentEvent"
          >({{ currentEvent.semester }} {{ currentEvent.year }})</span>
        </h4>
        <event-summary></event-summary>
      </div>
      <div v-else>
        <h4 class="subtitle is-4">No current event information. Check back later!</h4>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import EventSummary from 'components/events/EventSummary.vue';

export default {
  data() {
    return {
      error: '',
      loading: false
    };
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'isTeacher',
      'isCoordinator',
      'isAdmin',
      'currentEvent'
    ])
  },
  created() {
    this.loading = true;

    Promise.all([
      this.$store.dispatch('getCurrentEvent'),
      this.$store.dispatch('getEvents')
    ])
      .then(() => {
        this.error = '';
      })
      .catch(() => {
        this.error = 'Failed to load current event information.';
      })
      .then(() => {
        this.loading = false;
      });
  },
  components: {
    EventSummary
  }
};
</script>
