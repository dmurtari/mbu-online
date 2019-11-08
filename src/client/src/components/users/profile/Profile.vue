<template>
  <div>
    <h3 class="title is-3">Your Profile</h3>
    <h5 class="subtitle is-5">View and make changes to your profile</h5>
    <div class="columns">
      <div class="column is-3">
        <aside class="menu">
          <p class="menu-label">Manage Your Account</p>
          <ul class="menu-list">
            <router-link to="/profile/general">My Account</router-link>
            <router-link to="/profile/edit">Edit Account</router-link>
            <router-link to="/profile/password">Change Password</router-link>
            <router-link to="/profile/delete">Delete My Account</router-link>
          </ul>
        </aside>
      </div>
      <div class="column">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'profile'
    ])
  },
  beforeRouteEnter (to, from, next) {
    if (!localStorage.getItem('token')) {
      next((vm) => vm.$router.push('/'));
    }
    next();
  }
}
</script>

<style lang="scss" scoped>
.subtitle {
  padding-top: 1rem;
}
</style>
