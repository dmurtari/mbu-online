<template>
  <div>
    <closable-error v-if="error"
                    @dismissed="dismissError()">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else>
      <template v-if="editing">
        <edit-profile :propProfile="user"
                      :routable="false"
                      @done="toggleEdit()"></edit-profile>
      </template>
      <template v-else>
        <div class="section">
          <h3 class="title is-3">
            {{ user.firstname }} {{ user.lastname }}
            <button class="button is-white is-medium"
                    id="edit-user-button"
                    v-tooltip="'Edit User Profile'"
                    @click="toggleEdit()">
              <span class="icon is-large">
                <span class="fa fa-edit fa-lg"
                      aria-label="Edit"></span>
              </span>
            </button>
          </h3>
          <h5 class="subtitle is-5"
              v-if="user.details.troop">
            Troop {{ user.details.troop }}, {{ user.details.district }} District, {{ user.details.council
            }} Council
          </h5>
        </div>
        <div class="section">
          <h5 class="title is-5">User Details</h5>
          <ul>
            <li>
              <strong>Email: </strong> {{ user.email }}
            </li>
            <li>
              <strong>User Since: </strong> {{ user.created_at | shortDate }}
            </li>
          </ul>
        </div>
        <div class="section">
          <h5 class="title is-5">Scouts</h5>
          <div class="notification"
               v-if="user.scouts.length < 1">
            This user has not yet added any scouts to their troop.
          </div>
          <table class="table is-striped is-fullwidth"
                v-else>
            <thead>
              <tr>
                <th>Name</th>
                <th>Birthday</th>
                <th>Emergency Contact</th>
                <th>Emergency Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="scout in user.scouts"
                  :key="scout.id">
                <td>{{ scout.firstname }} {{ scout.lastname }}</td>
                <td>{{ scout.birthday | shortDate }}</td>
                <td>{{ scout.emergency_name }} ({{ scout.emergency_relation }})</td>
                <td>{{ scout.emergency_phone }}</td>
                <td>
                  <router-link :to="'/administration/scouts/list/' + scout.id ">Details</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import Edit from 'components/users/profile/Edit.vue';
import URLS from 'urls';

export default {
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      editing: false,
      error: '',
      loading: false,
      user: {}
    };
  },
  methods: {
    toggleEdit() {
      this.editing = !this.editing;

      if (!this.editing) {
        this.loadData();
      }
    },
    dismissError() {
      this.error = '';
    },
    loadData() {
      this.loading = true;
      axios
        .get(URLS.USERS_URL + this.id + '/scouts')
        .then(response => {
          this.user = response.data[0];
          this.error = '';
        })
        .catch(() => {
          this.error =
            'Failed to get user details. Please refresh or try again later.';
        })
        .then(() => {
          this.loading = false;
        });
    }
  },
  created() {
    this.loadData();
  },
  components: {
    'edit-profile': Edit
  }
};
</script>

<style lang="scss" scoped>
.section {
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 0rem;
  padding-right: 0rem;
}
</style>

