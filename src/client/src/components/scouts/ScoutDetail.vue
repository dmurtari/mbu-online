<template>
  <div>
    <div v-if="!loading && !eventLoading">
      <div class="section">
        <h3 class="title is-3">{{ scout.fullname }}</h3>
        <h5 class="subtitle is-5"> Troop {{ scout.troop }}</h5>
      </div>
      <scout-edit v-if="editScout"
                  @close="closeAndRefresh()"
                  :scout="scout"></scout-edit>
      <div class="section columns"
           v-if="!editScout">
        <div class="column is-6">
          <h5 class="title is-5">
            Scout Information
            <button class="button is-small is-white"
                    v-tooltip="'Edit Scout'"
                    @click="toggleEditScout()">
              <span class="icon is-small">
                <span class="fa fa-edit"
                      aria-label="Edit"></span>
              </span>
            </button>
          </h5>
          <ul>
            <li>
              <strong>First Name: </strong>{{ scout.firstname }}
            </li>
            <li>
              <strong>Last Name: </strong>{{ scout.lastname }}
            </li>
            <li>
              <strong>Birthday: </strong>{{ scout.birthday | shortDate }}
            </li>
            <li>
              <strong>Age: </strong>{{ scout.age }}
            </li>
            <li>
              <strong>Date Added: </strong>{{ scout.created_at | shortDate }}
            </li>
            <li>
              <strong>Notes: </strong>{{ scout.notes }}
            </li>
            <li>
              <strong>Emergency Contact: </strong>{{ scout.emergency_name }}
            </li>
            <li>
              <strong>Relationship to Scout: </strong>{{ scout.emergency_relation }}
            </li>
            <li>
              <strong>Emergency Number: </strong>{{ scout.emergency_phone }}
            </li>
          </ul>
        </div>
        <div class="column is-6"
             v-if="scout.user">
          <h5 class="title is-5">Coordinator Information</h5>
          <ul>
            <li>
              <strong>Name: </strong>{{ scout.user.fullname }}
            </li>
            <li>
              <strong>Email: </strong>{{ scout.user.email }}
            </li>
            <li>
              <strong>Council: </strong>{{ scout.user.details.council }}
            </li>
            <li>
              <strong>District: </strong>{{ scout.user.details.district }}
            </li>
            <li>
              <strong>Troop: </strong>{{ scout.user.details.troop }}
            </li>
          </ul>
        </div>
      </div>
      <div class="section">
        <spinner-page v-if="loadingRegistrations"></spinner-page>
        <div v-else>
          <h5 class="title is-5">Registration Information</h5>
          <div v-if="registrations.length > 0">
            <registration-container v-for="registration in orderedRegistrations"
                                    :scout="scout"
                                    :key="registration.id"
                                    :event="eventForId(registration.event_id)"
                                    :registration="registration"
                                    @done="reloadRegistrations()"
                                    class="registration">
            </registration-container>
          </div>
          <div v-else
               class="notification">
            This scout has not registered for any events.
          </div>
        </div>
      </div>
    </div>
    <spinner-page v-else></spinner-page>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';
import { mapGetters } from 'vuex';

import EventsUpdate from 'mixins/EventsUpdate';
import URLS from 'urls';
import RegistrationContainer from './RegistrationContainer.vue';
import ScoutEdit from './ScoutEdit.vue';

export default {
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      editScout: false,
      error: '',
      loading: false,
      loadingRegistrations: false,
      scout: {},
      registrations: {}
    };
  },
  computed: {
    ...mapGetters(['allEvents']),
    orderedRegistrations() {
      return _.orderBy(this.registrations, 'created_at');
    }
  },
  created() {
    this.reload();
  },
  methods: {
    closeAndRefresh() {
      this.editScout = false;
      this.reload();
    },
    eventForId(eventId) {
      return _.find(this.allEvents, { id: eventId });
    },
    reload() {
      this.loading = true;
      axios
        .get(URLS.SCOUTS_URL + this.id)
        .then(response => {
          this.scout = response.data;
          this.scout['id'] = this.scout.scout_id;
          this.scout['user_id'] = this.scout.user.user_id;
          this.error = '';
          this.reloadRegistrations();
        })
        .catch(() => {
          this.error = 'Failed to get details for this scout.';
        })
        .then(() => {
          this.loading = false;
        });
    },
    reloadRegistrations() {
      this.loadingRegistrations = true;
      return axios
        .get(URLS.SCOUTS_URL + this.id + '/registrations')
        .then(response => {
          this.registrations = response.data;
          this.error = '';
        })
        .catch(() => {
          this.error = 'Failed to get registrations for this scout.';
        })
        .then(() => {
          this.loadingRegistrations = false;
        });
    },
    toggleEditScout() {
      this.editScout = !this.editScout;
    }
  },
  watch: {
    $route() {
      this.reload();
    }
  },
  components: {
    RegistrationContainer,
    ScoutEdit
  },
  mixins: [EventsUpdate]
};
</script>

<style lang="scss" scoped>
.scout-details-loading {
  display: block;
  margin: auto;
  width: 5rem;
  margin-top: 5rem;
}

.section {
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 0rem;
  padding-right: 0rem;
}

.registration {
  padding-top: 1rem;
  padding-bottom: 2rem;
}
</style>
