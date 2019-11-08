<template>
  <div class="attendance-row">
    <h5 class="title is-5">
      Attendance Information for {{ scout.fullname }}
    </h5>
    <div>
      <scout-registration :event="event"
                          :preferences="registrationPreferences"
                          :purchases="registrationPurchases"
                          :assignments="assignmentList"
                          :showProjectedCost="false"
                          :showPreferences="false">
        <p slot="assignment-notification">
          {{ scout.fullname }} has not yet been assigned any merit badges for
          MBU {{ event.semester }} {{ event.year }}.
        </p>
      </scout-registration>
    </div>
  </div>
</template>

<script>
import ScoutRegistration from '../scouts/ScoutRegistration.vue';
import RegistrationMappers from '../../mixins/RegistrationMappers';

export default {
  components: {
    ScoutRegistration
  },
  mixins: [
    RegistrationMappers
  ]
}
</script>

<style lang="scss" scoped>
  .attendance-row {
    padding: 2rem 1rem;
    border-bottom: 1px lightgray solid;
  }
</style>
