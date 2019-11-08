<template>
  <div>
    <p>
      Use this page to view current users of this website.
    </p>
    <div class="box user-list-filters">
      <div class="columns">
        <div class="column is-6">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label"
                     for="user-list-role-filter">Role:</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <span class="select">
                    <select id="user-list-role-filter"
                            v-model="selectedRole">
                      <option v-for="option in roles"
                              :value="option.value"
                              :key="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label"
                     for="user-list-find">Search:</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input class="input"
                         id="user-list-find"
                         v-model="search">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <user-list :users="usersToDisplay"></user-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import UserList from './UserList.vue';

export default {
  data () {
    return {
      selectedRole: 'all',
      search: '',
      roles: [
        { text: 'All Users', value: 'all' },
        { text: 'Admins', value: 'admin' },
        { text: 'Coordinators/Scoutmasters', value: 'coordinator' },
        { text: 'Teachers/Volunteers', value: 'teacher' },
        { text: 'Others', value: 'anonymous' }
      ]
    };
  },
  computed: {
    ...mapGetters([
      'users',
    ]),
    usersInRole () {
      if (this.selectedRole === 'all') {
        return this.users;
      } else {
        return _.filter(this.users, (user) => {
          return user.role === this.selectedRole
        });
      }
    },
    usersToDisplay () {
      return _.filter(this.usersInRole, (user) => {
        return user.fullname.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    }
  },
  components: {
    UserList
  }
}
</script>

<style lang="scss">
.user-list-filters {
  margin-top: 2em;
}
</style>
