<template>
  <div id="app">
    <spinner-page v-if="loading"></spinner-page>
    <div class="site-wrapper"
         v-else>
      <navbar></navbar>
      <section class="section site-content">
        <div class="container"
             v-if="!isApproved && isApproved != null">
          <div class="notification is-warning">
            Your account has not yet been approved by an administrator. You can view Merit Badge and Event information,
            <span v-if="isCoordinator">
              but you will not be able to add scouts to your troop or register your troop for an event until your account
              is approved.
            </span>
            <span v-else-if="isTeacher">
              but you will not be able to edit requirements or class information until your account is approved.
            </span>
            <span v-else-if="isAdmin">
              but you will not be able to perform administrative tasks until your account is approved.
            </span>
            <span v-else>
              but you will not be able to perform other tasks until your account is approved.
            </span>
          </div>
        </div>
        <div class="container">
          <router-view></router-view>
        </div>
      </section>
      <mbu-footer></mbu-footer>
    </div>
  </div>
</template>

<script>
import Footer from 'components/navigation/Footer.vue';
import Navbar from 'components/navigation/Navbar.vue';

import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      loading: false
    }
  },
  components: {
    Navbar,
    'mbu-footer': Footer
  },
  computed: {
    ...mapGetters([
      'isApproved',
      'isCoordinator',
      'isTeacher',
      'isAdmin'
    ])
  },
  created() {
    this.loading = true;
    this.$store.dispatch('getProfile')
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin-bottom: 2rem;
}

.site-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-content {
  flex: 1;
}
</style>
