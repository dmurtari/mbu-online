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
          console.info('Created purchase for scout', details.scoutId, details.purchase);
          commit(types.SET_PURCHASES, {
            registrationId: details.registrationId,
            purchases: response.data.registration.purchases
          });
          resolve(response.data.registration.purchases);
        })
        .catch((err) => {
          console.error('Failed to purchase', details.purchase, err);
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
          console.info('Created registration for scout', details.scoutId, 'event', details.eventId);
          commit(types.ADD_REGISTRATION, response.data.registration);
          resolve(response.data.registration);
        })
        .catch(() => {
          console.error('Failed to register', details.scoutId, 'for', details.eventId);
          reject();
        })
    });
  },
  addScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.USERS_URL + details.userId + '/scouts', details.scout)
        .then((response) => {
          console.info('Added scout', response.data.scout, 'for user', details.userId);
          commit(types.ADD_SCOUT, response.data.scout);
          resolve(response.data.scout);
        })
        .catch((err) => {
          console.error('Failed to create scout with error', err.response.data.message);
          reject(err.response.data.message);
        })
    });
  },
  deletePurchase({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                   details.registrationId + '/purchases/' + details.purchasableId)
        .then(() => {
          console.info('Removed item', details.purchasableId);
          commit(types.DELETE_PURCHASE, details);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to delete purchasable', err);
          reject();
        });
    });
  },
  deleteRegistration({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.SCOUTS_URL + details.scoutId + '/registrations/' + details.eventId)
        .then(() => {
          console.info('Deleted registration for event', details.eventId);
          commit(types.DELETE_REGISTRATION, details);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to delete registration', err);
          reject();
        })
    });
  },
  deleteScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.USERS_URL + details.userId + '/scouts/' + details.scoutId)
        .then(() => {
          console.info('Deleted scout', details.scoutId, 'for user', details.userId);
          commit(types.DELETE_SCOUT, details.scoutId);
          resolve()
        })
        .catch((err) => {
          console.errpr('Failed to delete scout with error', err);
          reject();
        })
    });
  },
  getPurchases({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                details.registrationId + '/purchases')
        .then((response) => {
          console.info('Received purchases', response.data);
          commit(types.SET_PURCHASES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            purchases: response.data
          });
          resolve();
        })
        .catch((err) => {
          console.error('Failed to fetch purchases with', err);
          reject();
        })
    });
  },
  getPreferences({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                details.registrationId + '/preferences')
        .then((response) => {
          console.info('Received preferences', response.data);
          commit(types.SET_PREFERENCES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            preferences: response.data
          });
          resolve();
        })
        .catch((err) => {
          console.error('Failed to fetch preferences with', err);
          reject();
        })
    });
  },
  getScouts({ commit }, userId) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.USERS_URL + userId + '/scouts/registrations')
        .then((response) => {
          console.info('Got scouts for user', userId, response.data);
          commit(types.SET_SCOUTS, response.data);
          resolve(response.data);
        })
        .catch((err) => {
          console.error('Failed to get scouts', err);
          reject();
        })
    });
  },
  setPreferences({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SCOUTS_URL + details.scoutId + '/registrations/' +
                 details.registrationId + '/preferences', details.preferences)
        .then((response) => {
          console.info('Set preferences for registration', details.registrationId,
                      response.data.registration.preferences);
          commit(types.SET_PREFERENCES, {
            scoutId: details.scoutId,
            registrationId: details.registrationId,
            preferences: response.data.registration.preferences
          });
          resolve(response.data.registration.preferences);
        })
        .catch((err) => {
          console.error('Failed to set preferences', err);
          reject();
        })
    });
  },
  updateScout({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.USERS_URL + details.userId + '/scouts/' + details.scout.id, details.scout)
        .then((response) => {
          console.info('Updated scout', details.scout.id);
          commit(types.UPDATE_SCOUT, response.data.scout);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to update scout', err);
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
