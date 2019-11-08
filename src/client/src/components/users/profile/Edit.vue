<template>
  <div class="section">
    <h4 class="title is-4">Edit Your Information</h4>
    <form class="columns is-multiline">
      <div class="notification is-danger"
           v-if="error">
        {{ error }}
      </div>
      <div class="field column is-6">
        <label class="label"
               for="edit-firstname">First Name</label>
        <div class="control">
          <input type="text"
                 class="input"
                 id="edit-firstname"
                 :class="{ 'is-danger': $v.profileUpdate.firstname.$error }"
                 @blur="$v.profileUpdate.firstname.$touch"
                 v-model="profileUpdate.firstname">
        </div>
        <span class="help is-danger"
              v-if="$v.profileUpdate.firstname.$error">
          Please enter your first name
        </span>
      </div>
      <div class="field column is-6">
        <label class="label"
               for="edit-lastname">Last Name</label>
        <div class="control">
          <input type="text"
                 class="input"
                 id="edit-lastname"
                 :class="{ 'is-danger': $v.profileUpdate.lastname.$error }"
                 @blur="$v.profileUpdate.lastname.$touch"
                 v-model="profileUpdate.lastname">
        </div>
        <span class="help is-danger"
              v-if="$v.profileUpdate.lastname.$error">
          Please enter your last name
        </span>
      </div>
      <template v-if="profileToEdit.role === 'coordinator'">
        <div class="field column is-4">
          <label class="label"
                 for="edit-troop">Troop</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="edit-troop"
                   placeholder="Troop"
                   :class="{ 'is-danger': $v.profileUpdate.coordinator.troop.$error }"
                   @blur="$v.profileUpdate.coordinator.troop.$touch"
                   v-model="profileUpdate.coordinator.troop">
          </div>
          <span class="help is-danger"
                v-if="$v.profileUpdate.coordinator.troop.$error">
            Please enter the troop you are representing
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="edit-district">District</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="edit-district"
                   placeholder="District"
                   :class="{ 'is-danger': $v.profileUpdate.coordinator.district.$error }"

                   @blur="$v.profileUpdate.coordinator.district.$touch"
                   v-model="profileUpdate.coordinator.district">
          </div>
          <span class="help is-danger"
                v-if="$v.profileUpdate.coordinator.district.$error">
            Please enter your district
          </span>
        </div>
        <div class="field column is-4">
          <label class="label"
                 for="edit-council">Council</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="edit-council"
                   placeholder="Council"
                   :class="{ 'is-danger': $v.profileUpdate.coordinator.council.$error }"
                   @blur="$v.profileUpdate.coordinator.council.$touch"
                   v-model="profileUpdate.coordinator.council">
          </div>
          <span class="help is-danger"
                v-if="$v.profileUpdate.coordinator.council.$error">
            Please enter your council
          </span>
        </div>
      </template>
      <template v-if="profileToEdit.role === 'teacher'">
        <div class="field column is-12">
          <label class="label"
                 for="edit-chapter">Chapter/Organization</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="edit-chapter"
                   placeholder="Your group"
                   :class="{ 'is-danger': $v.profileUpdate.teacher.chapter.$error }"
                   @blur="$v.profileUpdate.teacher.chapter.$touch"
                   v-model="profileUpdate.teacher.chapter">
          </div>
          <span class="help is-danger"
                v-if="$v.profileUpdate.teacher.chapter.$error">
            Please enter the group you are affiliated with (e.g. APO chapter)
          </span>
        </div>
      </template>
      <div class="column is-12">
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary"
                    :class="{ 'is-loading': saving }"
                    :disabled="saving"
                    id="save-profile"
                    @click.prevent="update()">
              Save Changes
            </button>
          </div>
          <div class="control">
            <button class="button"
                    :disabled="saving"
                    id="cancel"
                    @click.prevent="cancel()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required, alphaNum } from 'vuelidate/lib/validators';

import _ from 'lodash';

export default {
  props: {
    propProfile: {
      type: Object
    },
    routable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      profileUpdate: {
        firstname: '',
        lastname: '',
        teacher: {
          chapter: ''
        },
        coordinator: {
          troop: '',
          district: '',
          council: ''
        }
      },
      error: '',
      saving: false
    };
  },
  computed: {
    ...mapGetters(['isAdmin', 'profile']),
    profileToEdit() {
      return this.propProfile ? this.propProfile : this.profile;
    }
  },
  methods: {
    cancel() {
      if (this.routable) {
        this.$router.push('/profile');
      } else {
        this.$emit('done');
      }
    },
    update() {
      this.saving = true;

      let profile = {
        id: this.profileToEdit.id,
        firstname: this.profileUpdate.firstname,
        lastname: this.profileUpdate.lastname
      };

      switch (this.profileToEdit.role) {
        case 'coordinator':
          profile.details = this.profileUpdate.coordinator;
          break;
        case 'teacher':
          profile.details = this.profileUpdate.teacher;
          break;
      }

      this.$store
        .dispatch('updateProfile', profile)
        .then(() => {
          this.error = '';
          this.cancel();
        })
        .catch(() => {
          this.error = 'Failed to save changes. Please try again.';
        })
        .then(() => {
          this.saving = false;
        });
    }
  },
  mounted() {
    this.profileUpdate.firstname = this.profileToEdit.firstname;
    this.profileUpdate.lastname = this.profileToEdit.lastname;
    this.profileUpdate[this.profileToEdit.role] = _.clone(this.profileToEdit.details);
  },
  validations: {
    profileUpdate: {
      firstname: { required },
      lastname: { required },
      coordinator: {
        troop: { required, alphaNum },
        district: { required },
        council: { required }
      },
      teacher: {
        chapter: { required }
      }
    },
    basicInfo: ['profileUpdate.firstname', 'profileUpdate.lastname'],
    coordinatorInfo: [
      'profileUpdate.coordinator.troop',
      'profileUpdate.coordinator.district',
      'profileUpdate.coordinator.council'
    ],
    teacherInfo: ['profileUpdate.teacher.chapter']
  }
};
</script>
