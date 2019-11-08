<template>
  <div class="is-fullwidth">
    <h5 class="title is-5">Modify Registration for {{ scout.fullname }}</h5>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <p>
      Edit merit badge preferences for {{ scout.fullname }} below. You must select six unique merit badges.
    </p>
    <br>
    <div v-if="!showDeleteConfirmation"
         class="columns is-multiline">
      <template v-for="(preference, index) in preferences">
        <div class="column field is-6 is-4-widescreen"
             :key="preference.offering">
          <label class="label"
                 :for="'registration-rank' + index">
            {{ index + 1 | ordinalSuffix }}&nbsp;choice:
          </label>
          <div class="control">
            <span class="select">
              <select class="input"
                      :id="'registration-rank' + index"
                      @blur="$v.preferences.$each[index].$touch"
                      :class="{ 'is-danger': $v.preferences.$each[index].$error }"
                      v-model="preference.offering">
                <option v-for="option in offerings"
                        :value="option.details.id"
                        :key="option.details.id">
                  {{ option.name }}
                  <span v-if="option.details.price !== '0.00'">
                    ({{ option.details.price | currency }})
                  </span>
                </option>
              </select>
            </span>
            <span class="help is-danger"
                  v-if="$v.preferences.$each[index].$error">
              Please select a {{ index + 1 | ordinalSuffix }}&nbsp;choice badge
            </span>
          </div>
        </div>
      </template>
      <purchases class="column is-12"
                 :event="event"
                 :purchasables="event.purchasables"
                 :existingPurchases="registration.purchases"
                 :scoutId="scout.id"
                 :registrationId="registration.details.id"></purchases>
      <div class="column is-12">
        <h5 class="title is-5">Save Changes for {{ scout.fullname }}</h5>
        <p>
          Once you are done editing {{ scout.fullname }}'s click the button below. You can also remove this registration
          by clicking the "Unregister" button.
        </p>
      </div>
      <div class="column is-12">
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary"
                    :disabled="$v.$invalid || saving"
                    :class="{ 'is-loading': saving }"
                    @click="save()">Done</button>
          </div>
          <div class="control">
            <button class="button"
                    :disabled="saving"
                    @click="cancel()">Cancel</button>
          </div>
          <div class="control is-pulled-right">
            <button class="button is-danger"
                    :disabled="saving"
                    @click.prevent="toggleDeleteConfirmation()">Unregister</button>
          </div>
        </div>
      </div>
    </div>
    <confirm-delete v-if="showDeleteConfirmation"
                    class="container-fluid"
                    :match-text="this.event.semester + ' ' + this.event.year"
                    :placeholder="this.event.semester + ' ' + this.event.year"
                    :cancelText="'Don\'t Remove'"
                    :confirmText="'Remove Registration'"
                    @deleteSuccess="deleteRegistration()"
                    @close="toggleDeleteConfirmation()">
      <span slot="header">
        Do you really want to unregister {{ scout.fullname }} from this event?
      </span>
      <span slot="help-text">
        Enter the event's semester and year to confirm that you wish to remove {{ scout.fullname }}'s registration
        for MBU {{ this.event.semester + ' ' + this.event.year }}. You can re-register {{ scout.fullname
        }} for this event at any time
        <b>before the event's registration closes ({{ event.registration_close | longDate }}).
        </b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import _ from 'lodash';

import { required } from 'vuelidate/lib/validators';

import Purchases from './Purchases.vue';

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
    registration: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      preferences: [],
      saving: false,
      error: '',
      showDeleteConfirmation: false
    };
  },
  computed: {
    offerings () {
      return _.orderBy(this.event.offerings, 'name');
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel');
    },
    deleteRegistration () {
      return this.$store.dispatch('deleteRegistration', {
        scoutId: this.scout.id,
        eventId: this.event.id
      })
        .then(() => {
          this.error = '';
          this.$emit('saved');
        })
        .catch(() => {
          this.error = 'Failed to delete registration. Please refresh and try again.';
        })
    },
    save () {
      if (!this.uniqueOfferings()) {
        this.error = 'Merit Badge requests cannot be duplicates.';
        return;
      }

      this.saving = true;
      return this.$store.dispatch('setPreferences', {
        scoutId: this.scout.id,
        registrationId: this.registration.details.id,
        preferences: this.preferences
      })
        .then(() => {
          this.error = '';
          this.$emit('saved');
        })
        .catch(() => {
          this.error = 'Failed to save preferences. Please refresh and try again';
        })
        .then(() => {
          this.saving = false;
        });
    },
    uniqueOfferings () {
      let offerings = _.map(this.preferences, 'offering');
      return _.uniq(offerings).length === offerings.length;
    },
    toggleDeleteConfirmation () {
      this.showDeleteConfirmation = !this.showDeleteConfirmation;
    },
  },
  mounted () {
    _.forEach(this.registration.preferences, (preference) => {
      this.preferences.push({
        offering: preference.offering_id,
        rank: preference.details.rank
      });
    });

    for (var i = this.preferences.length + 1; i <= 6; i++) {
      this.preferences.push({
        rank: i,
        offering: ''
      })
    }
  },
  components: {
    Purchases
  },
  validations: {
    preferences: {
      $each: {
        offering: { required }
      }
    }
  }
}
</script>

<style lang="scss" scope>
.is-fullwidth {
  width: 100%;
}
</style>
