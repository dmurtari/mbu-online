import * as types from '../mutation-types';
import URLS from '../../urls';

import _ from 'lodash';
import Vue from 'vue';
import axios from 'axios';

const state = {
  eventClasses: {}
};

const getters = {
  eventClasses(state) {
    return state.eventClasses;
  }
};

const mutations = {
  [types.SET_CLASSES](state, details) {
      Vue.set(state.eventClasses, details.eventId, details.classes);
  },
  [types.SET_CLASS_SIZES](state, details) {
    let existingClasses = state.eventClasses[details.eventId];

    if (existingClasses == undefined) {
      return;
    }

    let classes = [];

    _.forEach(existingClasses, (classInfo) => {
      const sizeInfo = _.find(details.sizes, sizeInfo => {
        return classInfo.badge.badge_id === sizeInfo.badgeId;
      });

      classes.push({
        ...classInfo,
        sizeInfo: (sizeInfo && sizeInfo.sizeLimits) || classInfo.sizeInfo || {}
      });
    });

    Vue.set(state.eventClasses, details.eventId, classes);
  }
};

const actions = {
  getClasses({ commit }, eventId) {
    return new Promise((resolve, reject) => {
      return axios
        .get(URLS.EVENTS_URL + eventId + '/offerings/assignees')
        .then(response => {
          commit(types.SET_CLASSES, {
            eventId: String(eventId),
            classes: response.data
          });

          resolve(response.data);
        })
        .catch(() => {
          reject();
        });
    });
  },
  getClassSizes({ commit }, details) {
    const requests = Promise.all(
      _.map(details.badgeIds, badgeId => {
        return axios.get(
          URLS.EVENTS_URL + details.eventId + '/badges/' + badgeId + '/limits'
        );
      })
    );

    return new Promise((resolve, reject) => {
      requests
        .then(responses => {
          const sizes = _.map(responses, (response, index) => {
            return {
              badgeId: details.badgeIds[index],
              sizeLimits: response.data
            };
          });

          commit(types.SET_CLASS_SIZES, {
            eventId: details.eventId,
            sizes: sizes
          });
          resolve(sizes);
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
