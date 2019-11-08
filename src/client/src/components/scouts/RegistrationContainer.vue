<template>
  <div>
    <div v-if="!loading">
      <h5 class="title is-5">
        {{ event.semester }} {{ event.year}}
        <button class="is-white button is-small"
                v-tooltip="'Edit Assignments'"
                @click.prevent="toggleEditing()"
                v-if="!editing">
          <span class="icon is-small">
            <span class="fa fa-edit"
                  aria-label="Edit Assignments"></span>
          </span>
        </button>
      </h5>
      <assignment-edit v-if="editing"
                       :scout="scout"
                       :event="event"
                       :preferences="registration.preferences"
                       :registration="registration"
                       @done="toggleEditing()"></assignment-edit>
      <scout-registration v-else
                          :event="event"
                          :preferences="registrationPreferences"
                          :purchases="registrationPurchases"
                          :assignments="assignmentList">
      </scout-registration>
    </div>
    <spinner-page v-else></spinner-page>
  </div>
</template>

<script>
import _ from 'lodash';

import ScoutRegistration from './ScoutRegistration.vue';
import AssignmentEdit from 'components/shared/attendance/AssignmentEdit.vue';

import RegistrationMappers from 'mixins/RegistrationMappers';
import ClassSizesUpdate from 'mixins/ClassSizesUpdate';

export default {
  data() {
    return {
      editing: false,
      error: '',
      loading: false
    };
  },
  methods: {
    toggleEditing() {
      this.editing = !this.editing;

      if (!this.editing) {
        this.$emit('done');
      }
    },
    maybeLoadClasses(eventId) {
      return new Promise((resolve, reject) => {
        if (this.hasClassInfoForEvent(eventId)) {
          resolve();
        }

        this.$store.dispatch('getClasses', eventId).then(classes => {
          return this.getSizesForBadges(
            eventId,
            _.map(classes, 'badge.badge_id')
          );
        })
        .then(() => resolve())
        .catch(() => reject());
      });
    }
  },
  components: {
    AssignmentEdit,
    ScoutRegistration
  },
  mounted() {
    this.loading = true;
    Promise.all([
      this.$store.dispatch('getRegistrations', this.event.id),
      this.maybeLoadClasses(this.event.id)
    ])
      .then(() => {
        this.error = '';
      })
      .catch(() => {
        this.error = 'Failed to load registration information.';
      })
      .then(() => {
        this.loading = false;
      });
  },
  mixins: [RegistrationMappers, ClassSizesUpdate]
};
</script>

<style lang="scss" scoped>

</style>
