import axios from 'axios';
import _ from 'lodash';
import Vue from 'vue';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  scouts: []
};

const getters = {
  scouts(state) {
    return _.orderBy(state.scouts, 'lastname');
  }
};

const mutations = {
  [types.ADD_REGISTRATION] (state, registration) {
    let scout = _.find(state.scouts, { id: registration.scout_id });
    scout.registrations.push({
      preferences: [],
      purchases: [],
      event_id: registration.event_id,
      details: registration
    });
  },
  [types.ADD_SCOUT] (state, scout) {
    state.scouts.push(scout);
  },
  [types.DELETE_PURCHASE] (state, details) {
    let registrations = _.flatten(_.map(state.scouts, 'registrations'));
    let registration = _.find(registrations, (registration) => {
      return registration.details.id === details.registrationId;
    });

    registration.purchases = _.reject(registration.purchases, (purchase) => {
      return purchase.id === details.purchasableId;
    });
  },
  [types.DELETE_REGISTRATION] (state, details) {
    let scout = _.find(state.scouts, { id: details.scoutId });
    scout.registrations = _.reject(scout.registrations, (registration) => {
      return registration.event_id === details.eventId;
    });
  },
  [types.DELETE_SCOUT] (state, scoutId) {
    state.scouts = _.reject(state.scouts, (existingScout) => {
      return existingScout.id === scoutId;
    });
  },
  [types.SET_PURCHASES] (state, details) {
    let registrations = _.flatten(_.map(state.scouts, 'registrations'));
    let registration = _.find(registrations, (registration) => {
      return registration.details.id === details.registrationId;
    });

    Vue.set(registration, 'purchases', details.purchases);
  },
  [types.SET_PREFERENCES] (state, details) {
    let scout = _.find(state.scouts, { id: details.scoutId });
    let registration = _.find(scout.registrations, (registration) => {
      return registration.details.id === details.registrationId;
    });
    Vue.set(registration, 'preferences', _.sortBy(details.preferences, ['details.rank']));
  },
  [types.SET_SCOUTS] (state, scouts) {
    state.scouts = scouts;
  },
  [types.UPDATE_SCOUT](state, updatedScout) {
    if (state.scouts.length < 1) {
      return;
    }

    let scout = _.find(state.scouts, { id: updatedScout.id });
    state.scouts = _.reject(state.scouts, (existingScout) => {
      return existingScout.id === updatedScout.id;
    });
    updatedScout.registrations = scout.registrations;
    state.scouts.push(updatedScout);
  }
};

const actions = {
  addPurchase({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                 details.registrationId + '/purchases/', details.purchase)
        .then((response) => {
          commit(types.SET_PURCHASES, {
            registrationId: details.registrationId,
            purchases: response.data.registration.purchases
          });
          resolve(response.data.registration.purchases);
        })
        .catch(() => {
          reject();
        })
    });
  },
  addRegistration({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SCOUTS_URL + details.scoutId + '/registrations/', {
        event_id: details.eventId
      })
        .then((response) => {
          commit(types.ADD_REGISTRATION, response.data.registration);
          resolve(response.data.registration);
        })
        .catch(() => {
          reject();
        })
    });
  },
  addScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.USERS_URL + details.userId + '/scouts', details.scout)
        .then((response) => {
          commit(types.ADD_SCOUT, response.data.scout);
          resolve(response.data.scout);
        })
        .catch((err) => {
          reject(err.response.data.message);
        })
    });
  },
  deletePurchase({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                   details.registrationId + '/purchases/' + details.purchasableId)
        .then(() => {
          commit(types.DELETE_PURCHASE, details);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  deleteRegistration({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.SCOUTS_URL + details.scoutId + '/registrations/' + details.eventId)
        .then(() => {
          commit(types.DELETE_REGISTRATION, details);
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  deleteScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.USERS_URL + details.userId + '/scouts/' + details.scoutId)
        .then(() => {
          commit(types.DELETE_SCOUT, details.scoutId);
          resolve()
        })
        .catch(() => {
          reject();
        })
    });
  },
  getPurchases({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                details.registrationId + '/purchases')
        .then((response) => {
          commit(types.SET_PURCHASES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            purchases: response.data
          });
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  getPreferences({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                details.registrationId + '/preferences')
        .then((response) => {
          commit(types.SET_PREFERENCES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            preferences: response.data
          });
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  getScouts({ commit }, userId) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.USERS_URL + userId + '/scouts/registrations')
        .then((response) => {
          commit(types.SET_SCOUTS, response.data);
          resolve(response.data);
        })
        .catch(() => {
          reject();
        })
    });
  },
  setPreferences({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                 details.registrationId + '/preferences', details.preferences)
        .then((response) => {
          commit(types.SET_PREFERENCES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            preferences: response.data.registration.preferences
          });
          resolve(response.data.registration.preferences);
        })
        .catch(() => {
          reject();
        })
    });
  },
  updateScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.USERS_URL + details.userId + '/scouts/' + details.scout.id, details.scout)
        .then((response) => {
          commit(types.UPDATE_SCOUT, response.data.scout);
          resolve();
        })
        .catch(() => {
          reject();
        })
    })
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
