<template>
  <div>
    <div class="column is-8 is-offset-2">
      <h1 class="title">Create Your Account</h1>
      <h3 class="subtitle">
        Welcome to MBU Online! Create your account here to be able to use all of the features
        of this website.
      </h3>
      <div class="notification is-info">
        Note that you will not be able to use your account to complete any tasks until your
        account has been approved by an administrator.
      </div>
      <div class="notification is-warning"
           v-if="!error">
        All fields are required.
      </div>
      <div class="notification is-danger"
           v-if="error">
        <button class="delete"
                @click.prevent="dismissError()"></button>
        <p>{{ error }}</p>
      </div>
      <form class="columns is-multiline">
        <div class="field column is-12">
          <label class="label"
                 for="signup-email">Email</label>
          <div class="control">
            <input type="email"
                   class="input"
                   id="signup-email"
                   placeholder="Your email address"
                   :class="{ 'is-danger': $v.credentials.email.$error }"
                   @blur="$v.credentials.email.$touch"
                   v-model="credentials.email">
          </div>
          <span v-if="$v.credentials.email.$error">
            <span class="help is-danger"
                  v-if="!$v.credentials.email.isUnique">
              An account already exists with the email address you specified.
              <router-link to="/reset">Forgot your password?</router-link>
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.email.email">
              The email address you entered is invalid
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.email.required">
              Your email address is required
            </span>
          </span>
        </div>
        <div class="field column is-half">
          <label class="label"
                 for="signup-password">Password</label>
          <div class="control">
            <input type="password"
                   class="input"
                   id="signup-password"
                   placeholder="Password"
                   :class="{ 'is-danger': $v.credentials.password.$error }"
                   @blur="$v.credentials.password.$touch"
                   v-model="credentials.password">
          </div>
          <span v-if="$v.credentials.password.$error">
            <span class="help is-danger"
                  v-if="!$v.credentials.password.minLength">
              Your password must be at least 8 characters
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.password.required">
              Please enter a password for your account
            </span>
          </span>
        </div>
        <div class="field column is-half">
          <label class="label"
                 for="signup-password-confirm">Password Confirmation</label>
          <div class="control">
            <input type="password"
                   class="input"
                   id="signup-password-confirm"
                   placeholder="Confirm your password"
                   :class="{ 'is-danger': $v.credentials.passwordConfirmation.$error }"
                   @blur="$v.credentials.passwordConfirmation.$touch"
                   v-model="credentials.passwordConfirmation">
          </div>
          <span v-if="$v.credentials.passwordConfirmation.$error">
            <span class="help is-danger"
                  v-if="!$v.credentials.passwordConfirmation.sameAs">
              The passwords you entered don't match
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.passwordConfirmation.required">
              Please confirm your password
            </span>
          </span>
        </div>
        <div class="field column is-half">
          <label class="label"
                 for="signup-first-name">First Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="signup-first-name"
                   placeholder="First Name"
                   :class="{ 'is-danger': $v.credentials.firstname.$error }"
                   @blur="$v.credentials.firstname.$touch"
                   v-model="credentials.firstname">
          </div>
          <span class="help is-danger"
                v-if="!$v.credentials.firstname.required && $v.credentials.firstname.$error">
            Please enter your first name
          </span>
        </div>
        <div class="field column is-half">
          <label class="label"
                 for="signup-last-name">Last Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="signup-last-name"
                   placeholder="Last Name"
                   :class="{ 'is-danger': $v.credentials.lastname.$error }"
                   @blur="$v.credentials.lastname.$touch"
                   v-model="credentials.lastname">
          </div>
          <span class="help is-danger"
                v-if="!$v.credentials.lastname.required && $v.credentials.lastname.$error">
            Please enter your last name
          </span>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="signup-role">I am a...</label>
          <div class="control">
            <span class="select">
              <select class="input"
                      id="signup-role"
                      :class="{ 'is-danger': $v.credentials.role.$error }"
                      @blur="$v.credentials.role.$touch"
                      @change="clearRoleDetails()"
                      v-model="credentials.role">
                <option v-for="option in roles"
                        :value="option.value"
                        :key="option.value">
                  {{ option.text }}
                </option>
              </select>
            </span>
          </div>
          <span class="help is-danger"
                v-if="!$v.credentials.role.required && $v.credentials.role.$error">
            Please pick your role
          </span>
        </div>
        <template v-if="credentials.role === 'coordinator'">
          <div class="field column is-one-third">
            <label class="label"
                   for="signup-troop">Troop</label>
            <div class="control">
              <input type="number"
                     class="input"
                     id="signup-troop"
                     placeholder="Troop"
                     :class="{ 'is-danger': $v.credentials.coordinator.troop.$error }"
                     @blur="$v.credentials.coordinator.troop.$touch"
                     v-model="credentials.coordinator.troop">
            </div>
            <span v-if="$v.credentials.coordinator.troop.$error">
              <span class="help is-danger"
                    v-if="!$v.credentials.coordinator.troop.alphaNum">
                Please enter a valid troop number
              </span>
              <span class="help is-danger"
                    v-if="!$v.credentials.coordinator.troop.required">
                Please enter the troop you represent
              </span>
            </span>
          </div>
          <div class="field column is-one-third">
            <label class="label"
                   for="signup-district">District</label>
            <div class="control">
              <input type="text"
                     class="input"
                     id="signup-district"
                     placeholder="District"
                     :class="{ 'is-danger': $v.credentials.coordinator.district.$error }"

                     @blur="$v.credentials.coordinator.district.$touch"
                     v-model="credentials.coordinator.district">
            </div>
            <span class="help is-danger"
                  v-if="!$v.credentials.coordinator.district.required && $v.credentials.coordinator.district.$error">
              Please enter your troop's district
            </span>
          </div>
          <div class="field column is-one-third">
            <label class="label"
                   for="signup-council">Council</label>
            <div class="control">
              <input type="text"
                     class="input"
                     id="signup-council"
                     placeholder="Council"
                     :class="{ 'is-danger': $v.credentials.coordinator.council.$error }"
                     @blur="$v.credentials.coordinator.council.$touch"
                     v-model="credentials.coordinator.council">
            </div>
            <span class="help is-danger"
                  v-if="!$v.credentials.coordinator.council.required && $v.credentials.coordinator.council.$error">
              Please enter your troop's council
            </span>
          </div>
        </template>
        <template v-if="credentials.role === 'teacher'">
          <div class="field column is-12">
            <label class="label"
                   for="signup-chapter">Chapter/Organization</label>
            <div class="control">
              <input type="text"
                     class="input"
                     id="signup-chapter"
                     placeholder="Your group"
                     :class="{ 'is-danger': $v.credentials.teacher.chapter.$error }"
                     @blur="$v.credentials.teacher.chapter.$touch"
                     v-model="credentials.teacher.chapter">
            </div>
            <span class="help is-danger"
                  v-if="!$v.credentials.teacher.chapter.required && $v.credentials.teacher.chapter.$error">
              Please enter the group you are affiliated with (e.g. APO chapter)
            </span>
          </div>
        </template>
        <div class="field column is-12">
          <button class="button is-primary"
                  :disabled="$v.basicInfo.$invalid || ( $v.teacherInfo.$invalid && $v.coordinatorInfo.$invalid)"

                  @click.prevent="submit()">Signup</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { required, email, sameAs, minLength, alphaNum } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      credentials: {
        email: '',
        password: '',
        passwordConfirmation: '',
        firstname: '',
        lastname: '',
        role: '',
        teacher: {
          chapter: ''
        },
        coordinator: {
          troop: '',
          district: '',
          council: ''
        }
      },
      roles: [
        { text: 'Scoutmaster/Coordinator', value: 'coordinator' },
        { text: 'Teacher/Volunteer', value: 'teacher' }
      ],
      error: '',
      creating: false
    }
  },
  methods: {
    clearRoleDetails () {
      this.credentials.teacher.chapter = '';
      this.credentials.coordinator.troop = '';
      this.credentials.coordinator.district = '';
      this.credentials.coordinator.council = '';
      this.$v.credentials.teacher.$reset();
      this.$v.credentials.coordinator.$reset();
    },
    dismissError () {
      this.error = '';
      this.$v.$reset();
    },
    submit () {
      this.creating = true;

      let credentials = {
        email: this.credentials.email,
        password: this.credentials.password,
        firstname: this.credentials.firstname,
        lastname: this.credentials.lastname,
        role: this.credentials.role
      }

      switch (credentials.role) {
        case 'coordinator':
          credentials.details = this.credentials.coordinator;
          break;
        case 'teacher':
          credentials.details = this.credentials.teacher;
          break;
      }

      this.$store.dispatch('signup', credentials)
        .then(() => {
          this.$router.push('/');
          this.error = '';
        })
        .catch(() => {
          this.error = 'Error creating your account. Please try again.';
        })
        .then(() => {
          this.creating = false;
        });
    }
  },
  validations: {
    credentials: {
      email: {
        required,
        email,
        isUnique (value) {
          if (value === '') return true
          return new Promise((resolve) => {
            this.$store.dispatch('checkEmail', value)
              .then((value) => resolve(!value));
          })
        }
      },
      password: { required, minLength: minLength(8) },
      passwordConfirmation: { required, sameAs: sameAs('password') },
      firstname: { required },
      lastname: { required },
      role: { required },
      coordinator: {
        troop: { required, alphaNum },
        district: { required },
        council: { required }
      },
      teacher: {
        chapter: { required }
      }
    },
    basicInfo: ['credentials.email', 'credentials.password', 'credentials.passwordConfirmation',
      'credentials.firstname', 'credentials.lastname', 'credentials.role'],
    coordinatorInfo: ['credentials.coordinator.troop', 'credentials.coordinator.district',
      'credentials.coordinator.council'],
    teacherInfo: ['credentials.teacher.chapter']
  }
}
</script>

<style lang="scss">
.column .columns {
  margin-bottom: -0.75rem;
}
</style>
