<template>
  <nav class="navbar has-shadow">
    <div class="container">
      <div class="navbar-brand">
        <router-link class="navbar-item"
                     to="/"
                     active-class="brand-active">
          <h5 class="title is-5">
            MBU Home
          </h5>
        </router-link>
        <span class="navbar-burger"
              :class="{ 'is-active': dropdownActive }"
              @click.prevent="toggleDropdown()">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
      <div class="navbar-menu"
           :class="{ 'is-active': dropdownActive }">
        <div class="navbar-start">
          <router-link class="navbar-item"
                       to="/badges">Badges</router-link>
          <router-link class="navbar-item"
                       to="/events">Events</router-link>
          <router-link class="navbar-item"
                       v-if="isCoordinator && isApproved"
                       to="/coordinator">Manage Troop</router-link>
          <router-link class="navbar-item"
                       v-if="isTeacher && isApproved"
                       to="/teacher">Instructor Tasks</router-link>
          <router-link class="navbar-item"
                       v-if="isAdmin"
                       to="/administration">Administration</router-link>
        </div>
        <div class="navbar-end">
          <span class="navbar-item"
                v-if="!isAuthenticated">
            <div class="field is-grouped">
              <div class="control">
                <router-link class="button is-primary"
                             to="/login">Login</router-link>
              </div>
              <div class="control">
                <router-link class="button is-info is-outlined"
                             to="/signup">Sign Up</router-link>
              </div>
            </div>
          </span>
          <router-link class="navbar-item"
                       v-if="isAuthenticated"
                       to="/profile">
            Profile
          </router-link>
          <span class="navbar-item"
                v-if="isAuthenticated">
            <a href="#"
               class="button"
               @click.prevent="logout()">Logout</a>
          </span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      dropdownActive: false
    };
  },
  computed: {
    ...mapGetters([
      'profile',
      'isAdmin',
      'isAuthenticated',
      'isApproved',
      'isCoordinator',
      'isTeacher'
    ])
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/');
    },
    toggleDropdown() {
      this.dropdownActive = !this.dropdownActive;
    }
  }
};
</script>

<style scoped lang="scss">
.container .dropdown-form {
  max-width: 400px;
  padding-bottom: 0.5em;
  padding-top: 0.5em;
}

.brand {
  font-variant: small-caps;
}
</style>
