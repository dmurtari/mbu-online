<template>
  <div class="attendance-row">
    <h5 class="title is-5">
      Attendance for {{ scout.fullname }} (Troop {{ scout.troop }})
      <button class="button edit-button is-pulled-right"
              v-if="state === 'displaying'"
              @click="toggleState('assigning')">
        <span class="fa fa-edit" aria-label="Edit"></span>
      </button>
    </h5>
    <div v-if="state === 'displaying'">
      <scout-registration :event="event"
                          :preferences="registrationPreferences"
                          :purchases="registrationPurchases"
                          :assignments="assignmentList">
        <p slot="assignment-notification">
          {{ scout.fullname }} has not yet been assigned any merit badges for
          MBU {{ event.semester }} {{ event.year }}.
          <br>
          <a class="is-text"
              @click.prevent="toggleState('assigning')">
            Assign Merit Badges
          </a>
        </p>
      </scout-registration>
    </div>
    <assignment-edit v-if="state === 'assigning'"
                     :scout="scout"
                     :classes="classes"
                     :event="event"
                     :preferences="preferences"
                     :registration="registration"
                     @done="toggleState('displaying')"></assignment-edit>
  </div>
</template>

<script>
import AssignmentEdit from './AssignmentEdit.vue';
import ScoutRegistration from 'components/scouts/ScoutRegistration.vue';
import RegistrationMappers from 'mixins/RegistrationMappers';

export default {
  props: {
    classes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      state: 'displaying'
    };
  },
  watch: {
    registration() {
      this.state = 'displaying';
    }
  },
  methods: {
    toggleState(state = 'displaying') {
      this.state = state;
    }
  },
  components: {
    AssignmentEdit,
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
