<template>
  <div>
    <closable-error v-if="error"
                    @dismissed="clearError()">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else>
      <span v-if="offering.requirements && offering.requirements.length > 0">
        Requirements are:
        <b>{{ offering.requirements | numAlphaSort | commaSeparated }}</b>
      </span>
      <span v-else>
        Requirements are not available.
      </span>
      <attendees v-for="n in 3"
                 :key="n"
                 :period="n"
                 :requirements="offering.requirements"
                 :offeringId="offeringId"
                 :eventId="eventId"
                 :scouts="scoutsForPeriod(n)"
                 @triggerRefresh="triggerRefresh()"></attendees>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import Attendees from './Attendees.vue';

export default {
  props: {
    offeringId: {
      type: Number,
      required: true
    },
    eventId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      assignees: [],
      loading: false,
      badge: '',
      error: '',
      offering: {}
    };
  },
  computed: {
    ...mapGetters(['allEvents', 'eventClasses']),
    event() {
      return _.find(this.allEvents, { id: this.eventId }) || {};
    },
    scoutsByPeriod() {
      let scoutPeriods = _.map(this.assignees, assignee => {
        let scout = {
          periods: assignee.assignment.periods,
          scout: assignee.scout
        };

        scout.scout.registrationId = assignee.registration_id;
        scout.scout.scoutId = assignee.scout_id;
        scout.scout.completions = assignee.assignment.completions;
        return scout;
      });

      return _.reduce(
        scoutPeriods,
        (acc, elt) => {
          _.forEach(elt.periods, period => {
            if (acc[period]) {
              acc[period].push(elt.scout);
            } else {
              acc[period] = [elt.scout];
            }
          });

          return acc;
        },
        []
      );
    }
  },
  methods: {
    clearError() {
      this.error = '';
    },
    refreshDetails() {
      let availableClasses = this.eventClasses[this.eventId] || {};

      _.forEach(availableClasses, availableClass => {
        if (availableClass.offering_id === this.offeringId) {
          this.offering = availableClass;
          this.assignees = availableClass.assignees;
          this.badge = availableClass.badge.name;
        }
      });

      this.$emit(
        'title',
        this.badge + ' (' + this.event.semester + ' ' + this.event.year + ')'
      );
    },
    scoutsForPeriod(period) {
      let scouts = this.scoutsByPeriod[period] || {};
      return _.orderBy(scouts, 'lastname');
    },
    triggerRefresh() {
      this.loading = true;
      this.$store
        .dispatch('getClasses', this.eventId)
        .then(() => {
          this.refreshDetails();
          this.error = '';
        })
        .catch(() => {
          this.error = 'Unable to load class details.';
        })
        .then(() => {
          this.loading = false;
        });
    }
  },
  created() {
    if (
      !this.eventClasses[this.eventId] ||
      this.eventClasses[this.eventId].length < 1
    ) {
      this.triggerRefresh();
    } else {
      this.refreshDetails();
    }
  },
  components: {
    Attendees
  }
};
</script>
