<template>
  <div>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <h5 class="title is-5">
      Register {{ scout.fullname }} for {{ event.semester }} {{ event.year}}
    </h5>
    <div class="columns is-multiline">
      <p class="column is-12">
        Please select the top six merit badges that {{ scout.firstname}} would like to attend
        classes for. We will do our best to accommodate preferences.
      </p>
      <template v-for="(preference, index) in preferences">
        <div class="column field is-6 is-4-widescreen"
             :key="index">
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
      <div class="column is-12">
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary"
                    :disabled="$v.$invalid || creating"
                    :class="{ 'is-loading': creating }"
                    @click="registerScout()">
              Register Scout
            </button>
          </div>
          <div class="control">
            <button class="button"
                    :disabled="creating"
                    @click="cancel()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import { required } from 'vuelidate/lib/validators';

export default {
  props: {
    scout: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      preferences: [],
      creating: false,
      error: ''
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
    registerScout () {
      if (!this.uniqueOfferings()) {
        this.error = 'Merit Badge requests cannot be duplicates.';
        return;
      }

      this.creating = true;
      this.$store.dispatch('addRegistration', {
        scoutId: this.scout.id,
        eventId: this.event.id
      })
        .then((registration) => {
          return this.$store.dispatch('setPreferences', {
            scoutId: this.scout.id,
            registrationId: registration.id,
            preferences: this.preferences
          })
        })
        .then(() => {
          this.error = '';
          this.$emit('created');
        })
        .catch(() => {
          this.error = 'Failed to register scout for this event.';
        })
        .then(() => {
          this.creating = false;
        });
    },
    uniqueOfferings () {
      let offerings = _.map(this.preferences, 'offering');
      return _.uniq(offerings).length === offerings.length;
    }
  },
  mounted () {
    for (var i = 1; i <= 6; i++) {
      this.preferences.push({
        rank: i,
        offering: ''
      })
    }
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
