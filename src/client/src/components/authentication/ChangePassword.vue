<template>
  <div>
    <form>
      <div class="notification is-danger"
           v-if="error">
        {{ error }}
      </div>
      <p class="subtitle">
        Enter the new password you would like to use to login to your account.
      </p>
      <div class="field">
        <label class="label"
               for="reset-password">
          New password
        </label>
        <div class="control">
          <input type="password"
                 class="input"
                 id="reset-password"
                 @blur="$v.password.$touch"
                 :class="{ 'is-danger': $v.password.$error }"
                 v-model="password"
                 required>
        </div>
        <span v-if="$v.password.$error">
          <span class="help is-danger"
                v-if="!$v.password.minLength">
            Password must be at least 8 characters long
          </span>
          <span class="help is-danger"
                v-if="!$v.password.required">
            Please provide your new password
          </span>
        </span>
      </div>
      <div class="field">
        <label class="label"
               for="reset-confirm">
          Confirm your password
        </label>
        <div class="control">
          <input type="password"
                 class="input"
                 id="reset-confirm"
                 @blur="$v.passwordConfirmation.$touch"
                 :class="{ 'is-danger': $v.passwordConfirmation.$error }"
                 v-model="passwordConfirmation"
                 required>
        </div>
        <span v-if="$v.passwordConfirmation.$error">
          <span class="help is-danger"
                v-if="!$v.passwordConfirmation.sameAs">
            Passwords do not match
          </span>
          <span class="help is-danger"
                v-if="!$v.passwordConfirmation.required">
            Please confirm your new password
          </span>
        </span>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :class="{ 'is-loading': sending }"
                  :disabled="$v.$invalid || sending"
                  @click.prevent="resetPassword()">
            Set Password
          </button>
        </div>
        <div class="control">
          <button class="button"
                  :class="{ 'is-loading': sending }"
                  :disabled="sending"
                  v-if="showCancel"
                  @click.prevent="cancel()">
            Cancel
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { required, sameAs, minLength } from 'vuelidate/lib/validators';

export default {
  data () {
    return {
      password: '',
      passwordConfirmation: '',
    }
  },
  props: {
    sending: {
      type: Boolean,
      required: true
    },
    error: {
      type: String,
      required: false
    },
    showCancel: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel');
    },
    resetPassword () {
      this.$emit('resetPassword', this.password);
    }
  },
  validations: {
    password: {
      required,
      minLength: minLength(8)
    },
    passwordConfirmation: {
      required,
      sameAs: sameAs('password')
    }
  }
}
</script>
