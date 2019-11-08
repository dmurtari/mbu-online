<template>
  <tr>
    <template v-if="!confirmDelete">
      <td>{{ user.fullname }}</td>
      <td>{{ user.role | titleCase }}</td>
      <td>{{ user.email }}</td>
      <td>
        <ul class="details-list">
          <li v-for="(value, key) in user.details"
              :key="user.id + key + value">
            <b>{{ key | titleCase}}:</b> {{ value | titleCase}}
          </li>
        </ul>
      </td>
      <td>
        <div class="right">
          <div class="field has-addons">
            <p class="control">
              <router-link class="button is-info is-outlined"
                           v-tooltip="'Details'"
                           :disabled="user.role != 'coordinator'"
                           :to="'/administration/users/current/' + user.id">
                <span class="icon is-small">
                  <span class="fa fa-info-circle"
                        aria-label="Details"></span>
                </span>
              </router-link>
            </p>
            <p class="control">
              <button class="button is-danger is-outlined"
                      :class="{ 'is-loading': deleting }"
                      v-tooltip="'Delete User'"
                      :disabled="deleting || user.id === profile.id"
                      @click="toggleConfirm()">
                <span class="icon is-small">
                  <span class="fa fa-trash"
                        aria-label="Delete Account"></span>
                </span>
              </button>
            </p>
          </div>
        </div>
      </td>
    </template>
    <template v-if="confirmDelete">
      <td colspan="5">
        <confirm-delete :match-text="this.user.fullname"
                        :placeholder="'Full Name'"
                        @deleteSuccess="deleteUser()"
                        @close="toggleConfirm()">
          <span slot="header">
            Are you sure you want to delete {{ user.fullname }}'s account? This cannot be undone, and will remove all data (such as scouts)
            associated with {{ user.fullname }}'s account.
          </span>
          <span slot="help-text">
            Enter the full name of this user with correct capitalization to confirm that you wish to delete this user.
            <strong>This action cannot be undone, and will remove all associated data.</strong>
          </span>
        </confirm-delete>
      </td>
    </template>
  </tr>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      deleting: false,
      confirmDelete: false
    };
  },
  computed: {
    ...mapGetters(['profile'])
  },
  methods: {
    clearError() {
      this.error = '';
    },
    deleteUser() {
      this.deleting = true;
      this.confirmDelete = false;

      this.$store
        .dispatch('deleteUser', this.user.id)
        .then(() => {
          this.error = '';
        })
        .catch(() => {
          this.error = 'Failed to delete user. Please try again later.';
        })
        .then(() => {
          this.deleting = false;
        });
    },
    toggleConfirm() {
      this.confirmDelete = !this.confirmDelete;
    }
  }
};
</script>

<style lang="scss" scoped>
.details-list {
  list-style: none;
  padding-left: 0;
}

.right {
  display: flex;
  flex-direction: row-reverse;
}
</style>
