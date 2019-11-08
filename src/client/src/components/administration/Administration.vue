<template>
  <div>
    <h3 class="title is-3">Site Administration</h3>
    <h5 class="subtitle is-5">
      Manage users, edit scouts and events, and view event details.
    </h5>
    <closable-error v-if="error">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else
         class="columns">
      <div class="column is-narrow sidebar">
        <aside class="menu">
          <p class="menu-label">Navigation</p>
          <ul class="menu-list">
            <router-link to="/administration/home">Home</router-link>
          </ul>
          <p class="menu-label">Manage</p>
          <ul class="menu-list">
            <li>
              <a @click="toggleUserMenu()">
                Users
                <span class="toggle-icons is-pulled-right">
                  <span v-if="showUserMenu"
                        class="fa fa-chevron-circle-up"></span>
                  <span v-else
                        class="fa fa-chevron-circle-down"></span>
                </span>
              </a>
              <ul v-if="showUserMenu">
                <router-link to="/administration/users/current">Current Users</router-link>
                <router-link to="/administration/users/approval">
                  Need Approval&nbsp;
                  <span class="tag is-pulled-right is-small"
                        :class="{ 'is-black': unapprovedUsers.length > 0 }">
                    {{ unapprovedUsers.length }}
                  </span>
                </router-link>
                <router-link to="/administration/users/admins">Administrators</router-link>
              </ul>
            </li>
          </ul>
          <ul class="menu-list">
            <li>
              <a @click="toggleScoutMenu()">
                Scouts
                <span class="toggle-icons is-pulled-right">
                  <span v-if="showScoutMenu"
                        class="fa fa-chevron-circle-up"></span>
                  <span v-else
                        class="fa fa-chevron-circle-down"></span>
                </span>
              </a>
              <ul v-if="showScoutMenu">
                <router-link to="/administration/scouts/list">All Scouts</router-link>
                <router-link to="/administration/scouts/assignments">Assignments</router-link>
              </ul>
            </li>
          </ul>
          <ul class="menu-list">
            <li>
              <a @click="toggleEventMenu()">
                Events
                <span class="toggle-icons is-pulled-right">
                  <span v-if="showEventMenu"
                        class="fa fa-chevron-circle-up"></span>
                  <span v-else
                        class="fa fa-chevron-circle-down"></span>
                </span>
              </a>
              <ul v-if="showEventMenu">
                <router-link to="/administration/events/all">All Events</router-link>
                <router-link to="/administration/events/badges">Available Badges</router-link>
                <router-link to="/administration/events/offerings">Offerings</router-link>
                <router-link to="/administration/events/purchasables">Purchasables</router-link>
                <router-link to="/administration/classes">Classes/Completions</router-link>
              </ul>
            </li>
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
import _ from 'lodash';

export default {
  data () {
    return {
      error: '',
      loading: false,
      showEventMenu: true,
      showScoutMenu: true,
      showUserMenu: true
    };
  },
  computed: {
    ...mapGetters([
      'users',
      'unapprovedUsers'
    ])
  },
  methods: {
    toggleEventMenu () {
      this.showEventMenu = !this.showEventMenu
    },
    toggleScoutMenu () {
      this.showScoutMenu = !this.showScoutMenu;
    },
    toggleUserMenu () {
      this.showUserMenu = !this.showUserMenu;
    }
  },
  watch: {
    $route () {
      let path = this.$route.path;
      if (_.startsWith(path, '/administration/events')) {
        this.showEventMenu = true;
      } else if (_.startsWith(path, '/administration/scouts')) {
        this.showScoutMenu = true;
      } else if (_.startsWith(path, '/administration/users')) {
        this.showUserMenu = true;
      }
    }
  },
  created () {
    this.loading = true;
    this.$store.dispatch('getUsers')
      .then(() => {
        if (this.unapprovedUsers.length > 0) {
          this.showUserMenu = true;
        }

        this.error = '';
      })
      .catch(() => {
        this.error = 'Failed to load users. Please refresh or try later.';
      })
      .then(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  padding-right: 2rem;
  min-width: 17rem;
}

span.tag {
  margin-top: -2px;
}

.subtitle {
  padding-top: 1rem;
}
</style>
