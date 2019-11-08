<template>
  <div class="section">
    <h4 class="title is-4">Delete Your Account</h4>
    <div class="notification is-danger"
         v-if="error">
      <p>{{ error }}</p>
    </div>
    <confirm-delete :match-text="this.firstname + ' ' + this.lastname"
                    :placeholder="'Full Name'"
                    @deleteSuccess="confirmDelete()"
                    @close="cancel()">
      <span slot="header">
        Do you really want to delete your account? This cannot be undone
      </span>
      <span slot="help-text">
        Enter your full name (capitalization matters) to confirm deleting your account.
        <b v-if="role==='coordinator'">
          This will also remove all scouts that you have registered, as well as their
          registration and completion records!
        </b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'profile'
    ]),
    firstname () { return this.profile.firstname },
    lastname () { return this.profile.lastname },
    role () { return this.profile.role },
    id () { return this.profile.id }
  },
  data () {
    return {
      error: ''
    };
  },
  methods: {
    confirmDelete () {
      this.$store.dispatch('deleteAccount', this.id)
        .then(() => {
          this.error = '';
          this.$router.push('/');
        })
        .catch(() => {
          this.error = 'Couldn\'t delete your account. Please contact an administrator';
        });
    },
    cancel () {
      this.error = '';
      this.$router.push('/profile');
    }
  }
}
</script>
