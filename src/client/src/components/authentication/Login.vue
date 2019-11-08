<template>
  <div>
    <div class="column is-three-quarters is-offset-2">
      <h1 class="title">Login</h1>
      <h3 class="subtitle">Welcome back to MBU Online!</h3>
      <div class="notification is-warning"
           v-if="error">
        <button class="delete"
                @click.prevent="dismissError()"></button>
        <p>Invalid email/password combination</p>
      </div>
      <div class="notification is-success"
           v-if="$route.query.from === 'resetSuccess'">
        <p>
          Successfully reset your password! Please login to your account with using new password.
        </p>
      </div>
      <form>
        <div class="field">
          <label class="label"
                 for="login-email">Email</label>
          <div class="control">
            <input type="email"
                   class="input is-expanded"
                   id="login-email"
                   placeholder="Enter your email"
                   :class="{ 'is-danger': $v.credentials.email.$error }"
                   @blur="$v.credentials.email.$touch"
                   v-model="credentials.email">
          </div>
          <span v-if="$v.credentials.email.$error">
            <span class="help is-danger"
                  v-if="!$v.credentials.email.email">
              Email address is invalid
            </span>
            <span class="help is-danger"
                  v-if="!$v.credentials.email.required">
              Email is required
            </span>
          </span>
        </div>
        <div class="field">
          <label class="label"
                 for="login-password">Password</label>
          <div class="control">
            <input type="password"
                   class="input is-expanded"
                   id="login-password"
                   placeholder="Password"
                   :class="{ 'is-danger': $v.credentials.password.$error }"
                   @blur="$v.credentials.password.$touch"
                   v-model="credentials.password">
          </div>
          <span class="help is-danger"
                v-if="!$v.credentials.password.required && $v.credentials.password.$error">
            Password is required
          </span>
        </div>
        <br>
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary"
                    :class="{ 'is-loading': loading }"
                    :disabled="$v.credentials.$invalid || loading"
                    @click.prevent="submit()">Login</button>
          </div>
          <div class="control">
            <button class="button is-info is-outlined"
                    :disabled="loading"
                    @click.prevent="signup()">Create an Account</button>
          </div>
          <div class="control">
            <router-link class="button is-text is-pulled-right"
                         :disabled="loading"
                         to="/reset">Forgot your password?</router-link>
          </div>
        </div>
        <br>
      </form>
    </div>
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'

export default {
  data () {
    return {
      credentials: {
        email: '',
        password: ''
      },
      error: false,
      loading: false
    }
  },
  methods: {
    dismissError () {
      this.$v.$reset();
      this.error = '';
    },
    submit () {
      let credentials = {
        email: this.credentials.email,
        password: this.credentials.password,
      }

      this.loading = true;
      this.$store.dispatch('login', credentials)
        .then(() => {
          this.error = false;
          this.$router.push('/');
        })
        .catch(() => {
          this.error = true;
        })
        .then(() => {
          this.loading = false;
        });
    },
    signup () {
      this.$emit('close');
      this.$router.push('/signup');
    },
    reset () {
      this.$emit('close');
      this.$router.push('/reset');
    }
  },
  validations: {
    credentials: {
      email: {
        required,
        email
      },
      password: {
        required
      }
    }
  }
}
</script>

<style scoped lang="scss">
a {
  cursor: pointer;
}
</style>
