<template>
  <div>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <form v-if="!showDeleteConfirmation">
      <div class="columns is-multiline">
        <div class="field column is-3">
          <label class="label"
                 for="scout-edit-first-name">First Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-edit-first-name"
                   placeholder="First Name"
                   :class="{ 'is-danger': $v.scoutUpdate.firstname.$error }"
                   @blur="$v.scoutUpdate.firstname.$touch"
                   v-model="scoutUpdate.firstname">
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.firstname.$error">
            Please enter the scout's first name
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-edit-last-name">Last Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-edit-last-name"
                   placeholder="Last Name"
                   :class="{ 'is-danger': $v.scoutUpdate.lastname.$error }"
                   @blur="$v.scoutUpdate.lastname.$touch"
                   v-model="scoutUpdate.lastname">
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.lastname.$error">
            Please enter the scout's last name
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-edit-birthday">Birthday</label>
          <div class="control">
            <masked-input mask="11/11/1111"
                          placeholder="mm/dd/yyyy"
                          id="scout-edit-birthday"
                          class="input"
                          :class="{ 'is-danger': $v.scoutUpdate.birthday.$error }"
                          @blur="$v.scoutUpdate.birthday.$touch"
                          v-model="scoutUpdate.birthday"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.birthday.$error">
            Please enter the scout's birthday
          </span>
        </div>
        <div class="field column is-3">
          <label class="label"
                 for="scout-edit-troop">Troop</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="scout-edit-troop"
                   placeholder="Troop"
                   :class="{ 'is-danger': $v.scoutUpdate.troop.$error }"
                   @blur="$v.scoutUpdate.troop.$touch"
                   v-model="scoutUpdate.troop">
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.troop.$error">
            Please enter the scout's troop
          </span>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="scout-edit-notes">Anything else we should know?</label>
          <div class="control">
            <textarea class="textarea"
                      id="scout-edit-notes"
                      rows="2"
                      placeholder="Allergies, dietery needs, etc."
                      v-model="scoutUpdate.notes"></textarea>
          </div>
        </div>
        <div class="column is-12">
          <h5 class="title is-5">Emergency Contact Information</h5>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-edit-emergency-name">Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-edit-emergency-name"
                   placeholder="Name"
                   :class="{ 'is-danger': $v.scoutUpdate.emergency_name.$error }"
                   @blur="$v.scoutUpdate.emergency_name.$touch"
                   v-model="scoutUpdate.emergency_name">
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.emergency_name.$error">
            Please enter the name of the person we should contact in event of emergency
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-edit-emergency-relation">Relation</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="scout-edit-emergency-relation"
                   placeholder="Relationship to Scout"
                   :class="{ 'is-danger': $v.scoutUpdate.emergency_relation.$error }"
                   @blur="$v.scoutUpdate.emergency_relation.$touch"
                   v-model="scoutUpdate.emergency_relation">
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.emergency_relation.$error">
            Please enter the relationship of the emergency contact to the scout
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="scout-edit-emergency-phone">Phone Number</label>
          <div class="control">
            <masked-input mask="(111) 111-1111"
                          placeholder="(___) ___-____"
                          id="scout-edit-emergency-phone"
                          class="input"
                          :class="{ 'is-danger': $v.scoutUpdate.emergency_phone.$error }"
                          @blur="$v.scoutUpdate.emergency_phone.$touch"
                          v-model="scoutUpdate.emergency_phone"></masked-input>
          </div>
          <span class="help is-danger"
                v-if="$v.scoutUpdate.emergency_phone.$error">
            Please enter the phone number of the person we should contact in event of emergency
          </span>
        </div>
        <div class="column">
          <div class="field is-grouped">
            <div class="control">
              <button class="button is-primary"
                      :disabled="$v.$invalid || saving"
                      :class="{ 'is-loading': saving }"
                      @click.prevent="saveScout()">Save</button>
            </div>
            <div class="control">
              <button class="button"
                      :disabled="saving"
                      @click.prevent="close()">Cancel</button>
            </div>
            <div class="control is-pulled-right">
              <button class="button is-danger"
                      :disabled="saving"
                      @click.prevent="toggleDeleteConfirmation()">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </form>
    <confirm-delete v-if="showDeleteConfirmation"
                    class="container-fluid"
                    :match-text="this.scout.firstname + ' ' + this.scout.lastname"
                    :placeholder="'Full Name'"
                    @deleteSuccess="deleteScout()"
                    @close="toggleDeleteConfirmation()">
      <span slot="header">
        Do you really want to delete this scout?
      </span>
      <span slot="help-text">
        Enter the scout's full name to confirm that you wish to delete this scout.
        <b>This action cannot be undone, and will permanently delete all associated records
          and registrations.</b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import { date, phone } from 'validators';

export default {
  data () {
    return {
      scoutUpdate: {
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
      saving: false,
      showDeleteConfirmation: false
    };
  },
  props: {
    scout: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters([
      'profile'
    ])
  },
  methods: {
    deleteScout () {
      this.$store.dispatch('deleteScout', {
        userId: this.scout.user_id,
        scoutId: this.scout.id
      })
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to delete scout. Please refresh and try again';
        })
    },
    saveScout () {
      this.saving = true;
      this.$store.dispatch('updateScout', {
        userId: this.scout.user_id,
        scout: this.scoutUpdate
      })
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to save changes. Please refresh and try again';
        })
        .then(() => {
          this.saving = false;
        });
    },
    toggleDeleteConfirmation () {
      this.showDeleteConfirmation = !this.showDeleteConfirmation;
    },
    close () {
      this.$emit('close');
    }
  },
  mounted () {
    this.scoutUpdate = _.clone(this.scout);
    this.scoutUpdate.birthday = moment(this.scoutUpdate.birthday).format('MM/DD/YYYY')
  },
  validations: {
    scoutUpdate: {
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
