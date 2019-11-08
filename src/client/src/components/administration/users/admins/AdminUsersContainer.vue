<template>
  <div>
    <h4 class="title is-4">
      Manage Administrative Users
    </h4>
    <div class="content">
      <p>
        Manage users that have administrative access to this website. Administrative have
        complete access to this website to create, edit, and delete anything. Administrative
        users cannot use their account to register scouts for events.
      </p>
      <p>
        <strong>
          Currently, you must create a new account for administrators manually, and the email
          address used can not be used with any other account.
        </strong>
      </p>
    </div>
    <closable-error v-if="error"
                    @dismissed="clearError()">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else>
      <button class="button is-primary"
              @click="toggleCreate()"
              v-if="!createAdmin">Create a new Admin</button>
      <create-admin-form v-if="createAdmin"
                         @close="toggleCreate()"
                         @created="refreshUsers()"></create-admin-form>
      <user-list class="admins"
                 :users="admins"></user-list>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import UserList from 'components/administration/users/UserList.vue';
import CreateAdminForm from './CreateAdminForm.vue';

export default {
  data () {
    return {
      createAdmin: false,
      error: '',
      loading: false
    }
  },
  computed: {
    ...mapGetters([
      'admins'
    ])
  },
  methods: {
    clearError () {
      this.error = '';
    },
    toggleCreate () {
      this.createAdmin = !this.createAdmin;
    },
    refreshUsers () {
      this.loading = true;

      this.$store.dispatch('getUsers')
        .then(() => {
          this.error = '';
        })
        .catch(() => {
          this.error = 'Failed to get users. Please try again later.';
        })
        .then(() => {
          this.loading = false;
        });
    }
  },
  created () {
    this.refreshUsers();
  },
  components: {
    CreateAdminForm,
    UserList
  }
}
</script>

<style lang="scss" scoped>
.admins {
  margin-top: 2rem;
}
</style>
