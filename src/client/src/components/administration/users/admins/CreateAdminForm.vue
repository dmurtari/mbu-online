<template>
  <div class="box">
    <h5 class="title is-5">Create a new Administrative User</h5>
    <div class="notification is-warning">
      <div class="content">
        <p>
          Remember that administrative users will have full access to this website, including
          creating, editing, and deleting any item (such as events, badges and records).
          If a user needs to only edit completion records and assignments, they should
          create a
          <strong>teacher</strong> account.
        </p>
        <p>
          After you create the account, the new user should proceed to the login page, enter
          the email that you used to create the account, and reset their password using
          the forgot password link.
        </p>
      </div>
    </div>
    <div v-if="showSuccess"
         class="notification is-info">
      The user has been successfully created. They will need to go to the login page, and
      reset their password using the forgot password link before they will be able
      to access their account.
    </div>
    <closable-error v-if="error"
                    @dismissed="clearError()">{{ error }}</closable-error>
    <form>
      <div class="columns is-multiline">
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
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.email.email">
              The email address you entered is invalid
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.email.required">
              An email address is required
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
            Please enter the user's first name
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
            Please enter the user's last name
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || creating"
                  :class="{ 'is-loading': creating }"
                  @click.prevent="createAdmin()">
            Create User</button>
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
import { required, email } from 'vuelidate/lib/validators';
import crypto from 'crypto';

export default {
  data () {
    return {
      credentials: {
        email: '',
        firstname: '',
        lastname: ''
      },
      error: '',
      creating: false,
      showSuccess: false
    }
  },
  methods: {
    clearError () {
      this.error = '';
    },
    close () {
      this.error = '';
      this.showSuccess = false;
      this.$emit('close');
    },
    createAdmin () {
      this.creating = true;
      this.showSuccess = false;

      let credentials = {
        email: this.credentials.email,
        password: crypto.randomBytes(20).toString('hex'),
        firstname: this.credentials.firstname,
        lastname: this.credentials.lastname,
        role: 'admin',
        approved: true
      };

      this.$store.dispatch('createAccount', credentials)
        .then((userId) => {
          this.$store.dispatch('approveUser', userId);
        })
        .then(() => {
          this.error = '';
          this.showSuccess = true;
          this.$emit('created');
          this.close();
        })
        .catch(() => {
          this.error = 'Error creating this account. Please try again later.';
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
      firstname: { required },
      lastname: { required }
    }
  }
}
</script>

<style lang="sass" scoped>

</style>
