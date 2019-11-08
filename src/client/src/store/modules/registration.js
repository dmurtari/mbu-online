import axios from 'axios';
import _ from 'lodash';
import Vue from 'vue';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  registrations: {}
};

const getters = {
  registrations(state) {
    return state.registrations;
  }
};

const mutations = {
  [types.SET_COMPLETION] (state, details) {
    let registration = _.find(state.registrations[details.eventId], (registration) => {
      return registration.registration_id === details.registrationId;
    });

    if (!registration) {
      return;
    }

    let assignment = _.find(registration.assignments, (assignment) => {
      return assignment.offering_id === details.offeringId;
    });

    Vue.set(assignment.details, 'completions', details.completions);
  },
  [types.SET_ASSIGNMENTS] (state, details) {
    let registration = _.find(state.registrations[details.eventId], (registration) => {
      return registration.registration_id === details.registrationId;
    });

    Vue.set(registration, 'assignments', details.assignments);
  },
  [types.SET_EVENT_REGISTRATIONS] (state, details) {
    Vue.set(state.registrations, details.eventId, details.registrations);
  }
};

const actions = {
  getRegistrations({ commit, rootState }, eventId) {
    let getURL;

    if (rootState.authentication.profile.role === 'coordinator') {
      getURL = URLS.USERS_URL + rootState.authentication.profile.id + '/events/'
        + eventId + '/registrations';
    } else {
      getURL = URLS.EVENTS_URL + eventId + '/registrations';
    }

    return new Promise((resolve, reject) => {
      axios.get(getURL)
        .then((response) => {
          console.info('Received registrations', response.data);
          commit(types.SET_EVENT_REGISTRATIONS, {
            eventId: eventId,
            registrations: response.data
          });
          resolve();
        })
        .catch((err) => {
          console.error('Failed to get registrations with', err);
          reject();
        });
    });
  },
  saveCompletions({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
        details.registrationId + '/assignments/' + details.offeringId, {
          completions: details.completions
        })
        .then((response) => {
          commit(types.SET_COMPLETION, {
            eventId: details.eventId,
            offeringId: details.offeringId,
            registrationId: details.registrationId,
            completions: details.completions
          })
          resolve(response.data);
        })
        .catch((err)=> {
          console.info('Failed to save completions', err);
          reject();
        })
    });
  },
  setAssignments({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
        details.registrationId + '/assignments', details.assignments)
        .then((response) => {
          console.info('Set assignments for registration', details.registrationId,
            response.data.registration.assignments);
          commit(types.SET_ASSIGNMENTS, {
            eventId: details.eventId,
            registrationId: details.registrationId,
            assignments: response.data.registration.assignments
          });
          resolve(response.data.registration.assignments);
        })
        .catch((err) => {
          console.error('Failed to set assignments', err);
          reject();
        })
    });
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
