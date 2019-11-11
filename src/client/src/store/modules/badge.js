import axios from 'axios';
import _ from 'lodash';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  badges: []
};

const getters = {
  badges(state) {
    return _.orderBy(state.badges, 'name');
  },
  badgeIdsAndNames(state) {
    return _.sortBy(_.map(state.badges, (badge) => {
      return {
        id: badge.id,
        name: badge.name
      }
    }), 'name');
  }
};

const mutations = {
  [types.ADD_BADGE] (state, badge) {
    state.badges.push(badge);
  },
  [types.DELETE_BADGE] (state, badgeId) {
    _.remove(state.badges, (badge) => {
      return badge.id === badgeId;
    });
  },
  [types.GET_BADGES] (state, badges) {
    state.badges = badges;
  },
  [types.UPDATE_BADGE] (state, badge) {
    let index = _.indexOf(state.badges, { id: badge.id });
    state.badges.splice(index, 1, badge);
  }
};

const actions = {
  addBadge({ commit }, badge) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.BADGES_URL, badge)
        .then((response) => {
          commit(types.ADD_BADGE, response.data.badge);
          resolve(badge);
        })
        .catch((err) => {
          reject(err.response.data.message);
        });
    });
  },
  deleteBadge({ commit }, badgeId) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.BADGES_URL + badgeId)
        .then(() => {
          commit(types.DELETE_BADGE, badgeId);
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  getBadges({ commit }) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.BADGES_URL)
        .then((response) => {
          commit(types.GET_BADGES, response.data);
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  updateBadge({ commit }, badgeUpdate) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.BADGES_URL + badgeUpdate.id, badgeUpdate)
        .then((response) => {
          commit(types.UPDATE_BADGE, response.data.badge);
          resolve(badgeUpdate);
        })
        .catch((err) => {
          reject(err.response.data.message);
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
