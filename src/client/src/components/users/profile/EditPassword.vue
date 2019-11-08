<template>
  <div class="section">
    <h4 class="title is-4">Change Your Password</h4>
    <change-password :sending="sending"
                     :error="error"
                     :showCancel="true"
                     @cancel="close()"
                     @resetPassword="resetPassword($event)"></change-password>
  </div>
</template>

<script>
import ChangePassword from 'components/authentication/ChangePassword.vue';

import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'profile'
    ])
  },
  data () {
    return {
      error: '',
      sending: false
    }
  },
  methods: {
    close () {
      this.$router.push('/profile');
    },
    resetPassword (password) {
      let data = {
        id: this.profile.id,
        password: password
      }

      this.sending = true;
      this.$store.dispatch('updateProfile', data)
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to reset password. Please try again.';
        })
        .then(() => {
          this.sending = false;
        });
    }
  },
  components: {
    'change-password': ChangePassword
  }
}
</script>
