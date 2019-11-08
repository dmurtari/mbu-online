<template>
  <div class="box">
    <h4 class="title is-4">
      Add a Scout to Your Troop
      <button class="button is-white close-button is-pulled-right"
              @click="close()">
        <span class="fa fa-close"
              aria-label="Close"></span>
      </button>
    </h4>
    <p>
      Add a new scout to your troop by filling in the information below. This will allow
      you to register this scout for events, and view their completion records on this
      website.
    </p>
    <br>
    <div class="notification"
         v-if="!error">
      <p>
        Name, birthday, troop, and emergency contact information are required.
      </p>
    </div>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <form>
      <div class="columns is-multiline">
        <div class="field column is-3">
          <label class="label"
                 for="scout-create-first-name">First Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-create-first-name"
                   placeholder="First Name"
                   :class="{ 'is-danger': $v.scout.firstname.$error }"
                   @blur="$v.scout.firstname.$touch"
                   v-model="scout.firstname">
          </div>
          <span class="help is-danger"
                v-if="$v.scout.firstname.$error">
            Please enter the scout's first name
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-create-last-name">Last Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-create-last-name"
                   placeholder="Last Name"
                   :class="{ 'is-danger': $v.scout.lastname.$error }"
                   @blur="$v.scout.lastname.$touch"
                   v-model="scout.lastname">
          </div>
          <span class="help is-danger"
                v-if="$v.scout.lastname.$error">
            Please enter the scout's last name
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-create-birthday">Birthday</label>
          <div class="control">
            <masked-input mask="11/11/1111"
                          placeholder="mm/dd/yyyy"
                          id="scout-create-birthday"
                          class="input"
                          :class="{ 'is-danger': $v.scout.birthday.$error }"
                          @blur="$v.scout.birthday.$touch"
                          v-model="scout.birthday"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.scout.birthday.$error">
            Please enter the scout's birthday
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-create-troop">Troop</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="scout-create-troop"
                   placeholder="Troop"
                   :class="{ 'is-danger': $v.scout.troop.$error }"
                   @blur="$v.scout.troop.$touch"
                   v-model="scout.troop">
          </div>
          <span class="help is-danger"
                v-if="$v.scout.troop.$error">
            Please enter the scout's troop
          </span>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="scout-create-notes">Anything else we should know?</label>
          <div class="control">
            <textarea class="textarea"
                      id="scout-create-notes"
                      rows="2"
                      placeholder="Allergies, dietery needs, etc."
                      v-model="scout.notes"></textarea>
          </div>
        </div>
        <div class="column is-12">
          <h5 class="title is-5">Emergency Contact Information</h5>
          <p>
            We will contact this person in the event that something happens to this scout. If
            possible, please enter the information for someone that will be able to
            reach the event should it be necessary.
          </p>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-create-emergency-name">Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-create-emergency-name"
                   placeholder="Name"
                   :class="{ 'is-danger': $v.scout.emergency_name.$error }"
                   @blur="$v.scout.emergency_name.$touch"
                   v-model="scout.emergency_name">
          </div>
          <span class="help is-danger"
                v-if="$v.scout.emergency_name.$error">
            Please enter the name of the person we should contact in event of emergency
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-create-emergency-relation">Relation</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-create-emergency-relation"
                   placeholder="Relationship to Scout"
                   :class="{ 'is-danger': $v.scout.emergency_relation.$error }"
                   @blur="$v.scout.emergency_relation.$touch"
                   v-model="scout.emergency_relation">
          </div>
          <span class="help is-danger"
                v-if="$v.scout.emergency_relation.$error">
            Please enter the relationship of the emergency contact to the scout
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-create-emergency-phone">Phone Number</label>
          <div class="control">
            <masked-input mask="(111) 111-1111"
                          placeholder="(___) ___-____"
                          id="scout-create-emergency-phone"
                          class="input"
                          :class="{ 'is-danger': $v.scout.emergency_phone.$error }"
                          @blur="$v.scout.emergency_phone.$touch"
                          v-model="scout.emergency_phone"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.scout.emergency_phone.$error">
            Please enter the phone number of the person we should contact in event of emergency
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || creating"
                  :class="{ 'is-loading': creating }"
                  @click.prevent="createScout()">Add Scout</button>
        </div>
        <div class="control">
          <button class="button"
                  :disabled="creating"
                  @click.prevent="close()">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { date, phone } from 'validators';

export default {
  data () {
    return {
      scout: {
        firstname: '',
        lastname: '',
        birthday: '',
        troop: '',
        notes: '',
        emergency_name: '',
        emergency_phone: '',
        emergency_relation: ''
      },
      error: '',
      creating: false
    };
  },
  computed: {
    ...mapGetters([
      'profile'
    ])
  },
  methods: {
    close () {
      this.error = '';
      this.$emit('close');
    },
    createScout () {
      this.creating = true;
      let scout = _.clone(this.scout);

      this.$store.dispatch('addScout', {
        scout: scout,
        userId: this.profile.id
      })
        .then(() => {
          return this.$store.dispatch('getScouts', this.profile.id);
        })
        .then(() => {
          this.$v.$reset();
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Error adding scout. Please refresh the page, and try again.';
        })
        .then(() => {
          this.creating = false;
        });
    }
  },
  mounted () {
    this.scout.troop = this.profile.details.troop;
  },
  validations: {
    scout: {
      firstname: { required },
      lastname: { required },
      birthday: { required, date: date('MM/DD/YYYY') },
      troop: { required },
      emergency_name: { required },
      emergency_phone: { required, phone },
      emergency_relation: { required }
    }
  }
}
</script>

<style scoped lang="scss">
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  margin-top: -.5em;
  margin-right: -.5em;
}
</style>
