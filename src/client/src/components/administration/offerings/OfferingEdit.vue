<template>
  <div>
    <h5 class="title is-5"
        v-if="creating">Create Offering for {{ badge.name }}</h5>
    <h5 class="title is-5"
        v-else>Editing {{ badge.name }}</h5>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <div class="notification is-danger"
         v-if="invalidPeriodsError">
      <p>
        {{ invalidPeriodsError }}
      </p>
    </div>
    <form class="form"
          v-if="!removing">
      <div class="columns is-multiline">
        <div class="field column is-4">
          <label class="label"
                 for="offering-periods">Offered Periods:</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="offering-periods"
                   v-model.lazy="editablePeriods"
                   :class="{ 'is-danger': $v.offering.periods.$error }"
                   @blur="$v.offering.periods.$touch"
                   placeholder="Periods">
          </div>
          <span v-if="$v.offering.periods.$error"
                class="help is-danger">
            <span v-if="!$v.offering.periods.required">
              Enter the periods this badge will be offered (separated by commas)
            </span>
            <span v-if="$v.offering.periods.$each.$error">
              Periods must be 1, 2, or 3
            </span>
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="offering-duration">Duration of Class:</label>
          <div class="control">
            <span class="input-group select duration-select">
              <select class="input"
                      id="offering-duration"
                      :class="{ 'is-danger': $v.offering.duration.$error }"
                      @blur="$v.offering.duration.$touch"
                      v-model="offering.duration">
                <option value="1">1 period</option>
                <option value="2">2 periods</option>
                <option value="3">3 periods</option>
              </select>
            </span>
          </div>
          <span class="help is-danger"
                v-if="$v.offering.duration.$error">
            Pick the duration of this class
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="offering-price">
            Price:
            <help-tag text="Any additional cost that the scout will need to pay
                                  to attend this class, in addition to the event fee">
            </help-tag>
          </label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="offering-price"
                   v-model="offering.price"
                   :class="{ 'is-danger': $v.offering.price.$error }"
                   @blur="$v.offering.price.$touch"
                   placeholder="Price">
          </div>
          <span class="help is-danger"
                v-if="$v.offering.price.$error">
            Enter the price of this class
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="offering-size-limit">
            Size Limit:
            <help-tag text="The limit to the amount of scouts that can attend a single period"></help-tag>
          </label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="offering-size-limit"
                   v-model="offering.size_limit"
                   :class="{ 'is-danger': $v.offering.size_limit.$error }"
                   @blur="$v.offering.size_limit.$touch"
                   placeholder="Size Limit">
          </div>
          <span class="help is-danger"
                v-if="$v.offering.size_limit.$error">
            Enter the size limit for this class
          </span>
        </div>
        <div class="field column is-8">
          <label class="label"
                 for="offering-requirements">
            Requirements:
            <help-tag text="A list of requirements that will be covered during
                                  class."></help-tag>
          </label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="offering-requirements"
                   v-model.lazy="editableRequirements"
                   :class=" { 'is-danger': $v.offering.requirements.$error }"
                   @blur="$v.offering.requirements.$touch"
                   placeholder="1, 2, 3a, 4">
          </div>
          <span class="help is-danger"
                v-if="$v.offering.requirements.$error">
            <span v-if="!$v.offering.requirements.required">
              Please specify the requirements that will be covered
            </span>
            <span v-if="$v.offering.requirements.$each.$error">
              Requirements can be a combination of numbers and letters, and must be separated by commas (e.g. 1, 2a,
              3b, 4).
            </span>
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || saving"
                  :class="{ 'is-loading': saving }"
                  @click.prevent="saveOffering()">
            Save Offering
          </button>
        </div>
        <div class="control">
          <button class="button is-light"
                  :disabled="saving"
                  @click.prevent="toggleEdit()">
            Cancel Changes
          </button>
        </div>
        <div class="control is-pulled-right"
             v-if="!creating">
          <button class="button is-danger"
                  :disabled="saving"
                  @click.prevent="toggleRemove()">
            Remove
          </button>
        </div>
      </div>
    </form>
    <confirm-delete v-if="removing"
                    :match-text="this.badge.name"
                    :placeholder="'Badge Name'"
                    @deleteSuccess="deleteOffering()"
                    @close="toggleRemove()">
      <span slot="header">
        Do you really want to remove this offering? This cannot be undone, and will likely break existing registration
        records!
      </span>
      <span slot="help-text">
        Enter the full name of this badge with correct capitalization to confirm that you wish to remove this
        offering.
        <b>This action cannot be undone, and will delete all associated completion records and badge requests!
          Adding this badge as an offering again will not restore previous records and requests!
        </b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import { required, between, alphaNum, numeric } from 'vuelidate/lib/validators';
import _ from 'lodash';

export default {
  props: {
    badge: {
      type: Object,
      required: true
    },
    eventId: {
      required: true
    },
    creating: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      offering: {
        periods: this.badge.periods || [],
        duration: this.badge.duration || 1,
        price: this.badge.price || '0.00',
        size_limit: this.badge.size_limit || 20,
        requirements: this.badge.requirements || []
      },
      invalidPeriodsError: '',
      removing: false,
      saving: false,
      error: ''
    };
  },
  computed: {
    editablePeriods: {
      get() {
        return _.join(_.sortBy(this.offering.periods), ', ');
      },
      set(newPeriods) {
        this.offering.periods = _.without(
          _.map(_.split(newPeriods, ',', 3), period => {
            let number = Number(_.trim(period));
            if (isNaN(number)) {
              return null;
            } else {
              return number;
            }
          }),
          null,
          0
        );
      }
    },
    editableRequirements: {
      get() {
        return _.join(_.sortBy(this.offering.requirements), ', ');
      },
      set(newRequirements) {
        this.offering.requirements = _.without(
          _.map(_.split(newRequirements, ','), requirement => {
            return String(_.trim(requirement));
          }),
          null,
          0
        );
      }
    },
    offered() {
      return !_.isEmpty(this.badge.periods);
    }
  },
  methods: {
    deleteOffering() {
      this.$store
        .dispatch('deleteOffering', {
          eventId: this.eventId,
          badgeId: this.badge.badge_id
        })
        .then(() => {
          this.toggleEdit();
          this.error = '';
        })
        .catch(() => {
          this.error =
            'Failed to remove badge from this event. Please try again';
        });
    },
    toggleRemove() {
      this.removing = !this.removing;
    },
    toggleEdit() {
      this.$emit('cancel');
    },
    saveOffering() {
      _.pull(this.offering.periods, null);
      let sortedPeriods = this.offering.periods.sort();

      if (this.offering.duration == 2 && !_.isEqual(sortedPeriods, [2, 3])) {
        this.error =
          'Offerings that last 2 periods must be assigned periods 2 and 3';
        return;
      }

      if (this.offering.duration == 3 && !_.isEqual(sortedPeriods, [1, 2, 3])) {
        this.error =
          'For offerings that last 3 periods, periods must be 1, 2, and 3';
        return;
      }

      this.saving = true;
      if (this.creating) {
        let offering = {
          badge_id: this.badge.badge_id,
          offering: this.offering
        };

        this.$store
          .dispatch('createOffering', {
            eventId: this.eventId,
            details: offering
          })
          .then(() => {
            this.error = '';
            this.toggleEdit();
          })
          .catch(() => {
            this.error =
              "Couldn't create offering. Please refresh and try again";
          })
          .then(() => {
            this.saving = false;
          });
      } else {
        this.$store
          .dispatch('updateOffering', {
            eventId: this.eventId,
            badgeId: this.badge.badge_id,
            offering: this.offering
          })
          .then(() => {
            this.error = '';
            this.toggleEdit();
          })
          .catch(() => {
            this.error = 'Failed to save badge. Please try again.';
          })
          .then(() => {
            this.saving = false;
          });
      }
    }
  },
  validations: {
    offering: {
      periods: { required, $each: { numeric, between: between(1, 3) } },
      duration: { required },
      price: { required },
      requirements: { required, $each: { alphaNum } },
      size_limit: { required, numeric }
    }
  }
};
</script>

<style lang="scss" scoped>
.submit-group {
  margin-top: 25px;
}

.duration-select {
  width: 100%;

  select {
    width: 100%;
  }
}
</style>
