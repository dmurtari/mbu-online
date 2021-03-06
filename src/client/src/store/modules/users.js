import axios from 'axios';
import _ from 'lodash';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  users: []
};

const getters = {
  admins(state) {
    return _.filter(state.users, (user) => {
      return user.role === 'admin';
    });
  },
  users(state) {
    return state.users;
  },
  unapprovedUsers(state) {
    return _.filter(state.users, (user) => {
      return !user.approved;
    });
  }
};

const mutations = {
  [types.APPROVE_USER](state, userId) {
    let user = _.find(state.users, (user) => {
      return user.id === userId;
    });

    user.approved = true;
  },
  [types.DELETE_USER](state, userId) {
    state.users = _.filter(state.users, (user) => {
      return user.id !== userId;
    });
  },
  [types.GET_USERS](state, users) {
    state.users = users;
  }
};

const actions = {
  approveUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.USERS_URL + userId, { approved: true })
        .then(() => {
          commit(types.APPROVE_USER, userId);
          resolve();
        })
        .catch(() => {
          reject();
        })
    });
  },
  deleteUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.USERS_URL + userId)
        .then(() => {
          commit(types.DELETE_USER, userId);
          resolve();
        })
        .catch(() => {
          reject();
        });
    })
  },
  getUsers({ commit }) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.USERS_URL)
        .then((response) => {
          commit(types.GET_USERS, response.data);
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
