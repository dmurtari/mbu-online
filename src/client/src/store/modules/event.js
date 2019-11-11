import axios from 'axios';
import _ from 'lodash';
import Vue from 'vue';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  events: [],
  currentEvent: {},
  defaultSelectedId: null
};

const mutations = {
  [types.ADD_EVENT](state, event) {
    state.events.push(event);
  },
  [types.DELETE_EVENT](state, eventId) {
    state.events = _.reject(state.events, event => {
      return event.id === eventId;
    });
  },
  [types.DELETE_OFFERING](state, details) {
    let event = _.find(state.events, { id: details.eventId });
    event.offerings = _.reject(event.offerings, offering => {
      return offering.id === details.badgeId;
    });
  },
  [types.DELETE_PURCHASABLE](state, details) {
    let event = _.find(state.events, { id: details.eventId });
    event.purchasables = _.reject(event.purchasables, purchasable => {
      return purchasable.id === details.purchasableId;
    });
  },
  [types.GET_EVENTS](state, events) {
    state.events = events;
  },
  [types.SET_CURRENT](state, event) {
    state.currentEvent = event;
  },
  [types.SET_PURCHASABLES](state, details) {
    let event = _.find(state.events, { id: details.eventId });
    Vue.set(event, 'purchasables', details.purchasables);
  },
  [types.SET_SELECTED](state, selectedId) {
    state.defaultSelectedId = selectedId;
  },
  [types.UPDATE_EVENT](state, event) {
    let index = _.findIndex(state.events, { id: event.id });
    state.events.splice(index, 1, event);
  },
  [types.UPDATE_OFFERING](state, offering) {
    let event = _.find(state.events, { id: offering.event_id });
    let existingOffering = _.find(event.offerings, { id: offering.badge_id });
    existingOffering.details = offering;
  },
  [types.UPDATE_PURCHASABLE](state, details) {
    let event = _.find(state.events, { id: details.eventId });
    let index = _.findIndex(event.purchasables, purchasable => {
      return purchasable.id === details.purchasable.id;
    });
    event.purchasables.splice(index, 1, details.purchasable);
  }
};

const getters = {
  allEvents(state) {
    return state.events;
  },
  currentEvent(state) {
    return _.find(state.events, event => {
      return event.id === state.currentEvent.id;
    }) || {};
  },
  currentEventIndex(state) {
    return _.findIndex(state.events, event => {
      return event.id === state.currentEvent.id;
    });
  },
  isCurrentEvent: state => eventId => {
    return state.currentEvent.id === eventId;
  },
  orderedEvents(state) {
    return _.orderBy(state.events, 'date', 'desc');
  },
  offeringsForEvent: state => eventId => {
    let event = _.find(state.events, { id: eventId });
    if (!event) {
      return [];
    }
    return event.offerings;
  },
  selectedEventId(state) {
    return state.defaultSelectedId;
  }
};

const actions = {
  addEvent({ commit }, event) {
    return new Promise((resolve, reject) => {
      axios
        .post(URLS.EVENTS_URL, event)
        .then(response => {
          commit(types.ADD_EVENT, response.data.event);
          resolve(response.data.event);
        })
        .catch(err => {
          reject(err.response.data.message);
        });
    });
  },
  createOffering({ commit }, offering) {
    return new Promise((resolve, reject) => {
      axios
        .post(URLS.EVENTS_URL + offering.eventId + '/badges', offering.details)
        .then(response => {
          commit(types.UPDATE_EVENT, response.data.event);
          resolve();
        })
        .catch(err => {
          reject(err.response.data.message);
        });
    });
  },
  createPurchasable({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .post(
          URLS.EVENTS_URL + details.eventId + '/purchasables',
          details.purchasable
        )
        .then(response => {
          commit(types.SET_PURCHASABLES, {
            eventId: details.eventId,
            purchasables: response.data.purchasables
          });
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  deleteEvent({ commit }, eventId) {
    return new Promise((resolve, reject) => {
      axios
        .delete(URLS.EVENTS_URL + eventId)
        .then(() => {
          commit(types.DELETE_EVENT, eventId);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  deleteOffering({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .delete(
          URLS.EVENTS_URL + details.eventId + '/badges/' + details.badgeId
        )
        .then(() => {
          commit(types.DELETE_OFFERING, details);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  deletePurchasable({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .delete(
          URLS.EVENTS_URL +
          details.eventId +
          '/purchasables/' +
          details.purchasableId
        )
        .then(() => {
          commit(types.DELETE_PURCHASABLE, details);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  getEvents({ commit, state }) {
    if (state.events.length > 1) {
      return;
    }

    return new Promise((resolve, reject) => {
      axios
        .get(URLS.EVENTS_URL)
        .then(response => {
          commit(types.GET_EVENTS, response.data);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  getPurchasables({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .get(URLS.EVENTS_URL + details.eventId + '/purchasables')
        .then(response => {
          commit(types.SET_PURCHASABLES, {
            eventId: details.eventId,
            purchasables: response.data
          });
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  getCurrentEvent({ commit, state }) {
    if (state.currentEvent && state.currentEvent.id) {
      return;
    }

    return new Promise((resolve, reject) => {
      axios
        .get(URLS.CURRENT_EVENT_URL)
        .then(response => {
          commit(types.SET_CURRENT, response.data);
          resolve(response.data);
        })
        .catch(() => {
          reject();
        });
    });
  },
  setSelectedId({ commit }, eventId) {
    commit(types.SET_SELECTED, eventId);
    return;
  },
  saveCurrentEvent({ commit }, eventId) {
    return new Promise((resolve, reject) => {
      axios
        .post(URLS.CURRENT_EVENT_URL, { id: eventId })
        .then(response => {
          commit(types.SET_CURRENT, response.data.currentEvent);
          resolve(response.data.currentEvent);
        })
        .catch(err => {
          reject(err.response.data.message);
        });
    });
  },
  updateEvent({ commit }, eventUpdate) {
    return new Promise((resolve, reject) => {
      axios
        .put(URLS.EVENTS_URL + eventUpdate.id, eventUpdate)
        .then(response => {
          commit(types.UPDATE_EVENT, response.data.event);
          resolve(response.data.event);
        })
        .catch(err => {
          reject(err.response.data.message);
        });
    });
  },
  updateOffering({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .put(
          URLS.EVENTS_URL + details.eventId + '/badges/' + details.badgeId,
          details.offering
        )
        .then(response => {
          commit(types.UPDATE_OFFERING, response.data.offering);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  },
  updatePurchasable({ commit }, details) {
    return new Promise((resolve, reject) => {
      axios
        .put(
          URLS.EVENTS_URL +
          details.eventId +
          '/purchasables/' +
          details.purchasable.id,
          details.purchasable
        )
        .then(response => {
          commit(types.UPDATE_PURCHASABLE, {
            eventId: details.eventId,
            purchasable: response.data.purchasable
          });
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
