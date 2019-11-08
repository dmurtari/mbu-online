<template>
  <div>
    <b>Assign Merit Badges</b>
    <p>
      Assign Merit Badges for {{ scout.fullname }} for MBU {{ event.semester }} {{ event.year }} here. Select
      a merit badge from the dropdown for each period. Merit Badges that are not offered for that period
      are grayed out.
    </p>
    <br>
    <p>
      {{ scout.fullname }} has listed as their preferences:
    </p>
    <ul>
      <li v-for="preference in preferences"
          :key="preference.offering_id">
        {{ preference.details.rank }}: {{ preference.badge.name }}
        <span v-if="preference.price !== '0.00'">
          ({{ preference.price | currency }})
        </span>
      </li>
    </ul>
    <form class="form">
      <div class="columns">
        <div v-for="n in 3"
             :key="n"
             class="field column is-4">
          <label class="label"
                 for="period-1-assignment">Period {{ n }}:</label>
          <div class="control">
            <span class="input-group select">
              <select class="input"
                      :id="'period-' + n + '-assignment'"
                      @change="maybeRespondToDuration($event.target.value, n)"
                      v-model="assignments[n - 1]">
                <option :value="null">No Assignment</option>
                <option disabled></option>
                <optgroup label="Preferences">
                  <option v-for="preference in preferences"
                          :key="preference.offering_id"
                          :value="preference.offering_id"
                          :disabled="!offered(preference.offering_id, n) || classFull(preference.offering_id, n)">
                    {{ preference.badge.name }}
                    <span v-if="preference.price !== '0.00'">
                      ({{ preference.price | currency }})
                    </span>
                    <span v-if="preference.duration > 1">
                      ({{ preference.duration }} periods)
                    </span>
                    <span v-if="sizeInfoForOffering(event.id, preference.offering_id)">
                      ({{ sizeInfoText(preference.offering_id, n) }})
                    </span>
                  </option>
                </optgroup>
                <option disabled></option>
                <optgroup label="All Offerings">
                  <option v-for="offering in sortedOfferings"
                          :key="offering.details.id"
                          :value="offering.details.id"
                          :disabled="!offered(offering.details.id, n) || classFull(offering.details.id, n)">
                    {{ offering.name }}
                    <span v-if="offering.details.price !== '0.00'">
                      ({{ offering.details.price | currency }})
                    </span>
                    <span v-if="offering.details.duration > 1">
                      ({{ offering.details.duration }} periods)
                    </span>
                    <span v-if="sizeInfoForOffering(event.id, offering.details.id)">
                      ({{ sizeInfoText(offering.details.id, n) }})
                    </span>
                  </option>
                </optgroup>
              </select>
            </span>
          </div>
        </div>
      </div>
    </form>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-primary"
                :disabled="saving"
                :class=" {'is-loading': saving }"
                @click="setAssignments()">Save Assignments</button>
      </div>
      <div class="control">
        <button class="button"
                :disabled="saving"
                @click="$emit('done')">Cancel</button>
      </div>
    </div>

  </div>
</template>

<script>
import _ from 'lodash';

import ClassSizesUpdate from 'mixins/ClassSizesUpdate';

export default {
  props: {
    scout: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    },
    preferences: {
      type: Array,
      default: () => {
        return [];
      }
    },
    registration: {
      type: Object,
      require: true
    },
    classes: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      assignments: [],
      saving: false
    };
  },
  computed: {
    sortedOfferings() {
      return _.orderBy(this.event.offerings, 'name');
    }
  },
  methods: {
    classFull(offeringId, period) {
      return this.sizeInfoForOffering(this.event.id, offeringId)[period] >=
        this.sizeInfoForOffering(this.event.id, offeringId).size_limit;
    },
    maybeRespondToDuration(offeringId) {
      let offering = _.find(this.event.offerings, offering => {
        return offering.details.id === Number(offeringId);
      });

      if (!offering || offering.details.duration < 2) {
        return;
      } else {
        this.assignments[1] = offeringId;
        this.assignments[2] = offeringId;
      }
    },
    offered(offeringId, period) {
      let offering = _.find(this.event.offerings, offering => {
        return offering.details.id === offeringId;
      });

      return _.indexOf(offering.details.periods, period) >= 0;
    },
    setAssignments() {
      this.saving = true;

      let postData = [];

      _.forEach(this.assignments, (assignment, index) => {
        if (!assignment) {
          return;
        }

        let existingData = _.find(postData, { offering: assignment });
        let existingAssignment = _.find(this.registration.assignments, {
          offering_id: assignment
        });

        if (existingData) {
          existingData.periods.push(index + 1);
        } else {
          postData.push({
            periods: [index + 1],
            offering: assignment,
            completions:
              (existingAssignment && existingAssignment.details.completions) ||
              []
          });
        }
      });

      this.$store
        .dispatch('setAssignments', {
          scoutId: this.scout.scout_id,
          registrationId: this.registration.id,
          assignments: postData,
          eventId: this.event.id
        })
        .then(() => {
          this.loadClasses(this.event.id);
        })
        .then(() => {
          this.error = '';
          this.$emit('done');
        })
        .catch(() => {
          this.error =
            'Failed to save assignments. Please refresh and try again';
        })
        .then(() => {
          this.saving = false;
        });
    },
    sizeInfoText(offeringId, period) {
      return `${this.sizeInfoForOffering(this.event.id, offeringId)[
        period
      ]} of ${this.sizeInfoForOffering(this.event.id, offeringId).size_limit}`;
    }
  },
  mounted() {
    let result = [null, null, null];

    _.forEach(this.registration.assignments, assignment => {
      return _.forEach(assignment.details.periods, period => {
        result[Number(period) - 1] = assignment.offering_id;
      });
    });

    this.assignments = result;
  },
  mixins: [ClassSizesUpdate]
};
</script>

<style lang="scss" scoped>
li {
  padding-left: 1rem;
}

form {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
