import axios from 'axios';

import * as types from '../mutation-types';
import URLS from '../../urls';

const state = {
  profile: {},
  isAuthenticated: false
};

const getters = {
  profile(state) {
    return state.profile;
  },
  role(state) {
    return state.profile.role;
  },
  isAuthenticated(state) {
    return state.isAuthenticated;
  },
  isApproved(state) {
    return state.profile.approved;
  },
  isTeacher(state) {
    return state.profile.role === 'teacher';
  },
  isCoordinator(state) {
    return state.profile.role === 'coordinator';
  },
  isAdmin(state) {
    return state.profile.role === 'admin';
  },
  isTeacherOrAdmin(state) {
    return state.profile.role === 'teacher' || state.profile.role === 'admin';
  },
  isCoordinatorOrAdmin(state) {
    return state.profile.role === 'coordinator' || state.profile.role === 'admin';
  }
};

const mutations = {
  [types.LOGIN](state, response) {
    state.profile = response.profile;
    state.isAuthenticated = true;
    if (response.token) {
      localStorage.setItem('token', response.token);
      axios.defaults.headers.common['Authorization'] = response.token;
    }
  },
  [types.LOGOUT](state) {
    state.profile = {};
    state.isAuthenticated = false;
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = '';
  },
  [types.PROFILE](state, profile) {
    state.profile = profile;
    state.isAuthenticated = true;
    axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');
  }
};

const actions = {
  checkEmail(context, email) {
    return new Promise((resolve, reject) => {
      axios.get(URLS.USERS_URL + 'exists/' + email)
        .then((response) => {
          console.info('Got response', response.data.exists);
          resolve(response.data.exists);
        })
        .catch((err) => {
          console.error('Failed to check for user', err);
          reject();
        });
    });
  },
  createAccount(context, credentials) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SIGNUP_URL, credentials)
        .then((response) => {
          console.info('Successfully created user');
          resolve(response.data.profile.id);
        })
        .catch((err) => {
          console.error('Failed to create user');
          reject(err.response.data.message);
        });
    });
  },
  deleteAccount({ commit }, id) {
    return new Promise((resolve, reject) => {
      axios.delete(URLS.USERS_URL + id)
        .then(() => {
          console.info('Account deleted');
          commit(types.LOGOUT);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to delete account', err);
          reject();
        })
    });
  },
  getProfile({ commit }) {
    return new Promise((resolve, reject) => {
      let token = localStorage.getItem('token');

      axios.get(URLS.PROFILE_URL, {
        headers: { 'Authorization': token }
      })
        .then((response) => {
          console.info('Successfully authenticated from JWT');
          commit(types.PROFILE, response.data.profile);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to authenticate JWT', err);
          localStorage.removeItem('token');
          reject();
        });
    });
  },
  login({ commit }, credentials) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.LOGIN_URL, credentials)
        .then((response) => {
          console.info('Successfully logged in user');
          commit(types.LOGIN, response.data);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to login user');
          reject(err.response.data.message);
        });
    });
  },
  signup({ commit }, credentials) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.SIGNUP_URL, credentials)
        .then((response) => {
          console.info('Successfully created user');
          commit(types.LOGIN, response.data);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to create user');
          reject(err.response.data.message);
        });
    });
  },
  sendResetEmail(context, email) {
    let data = {
      email: email,
      url: URLS.RESET_URL
    };

    return new Promise((resolve, reject) => {
      axios.post(URLS.FORGOT_URL, data)
        .then(() => {
          console.info('Send reset email to', email);
          resolve();
        })
        .catch((err) => {
          console.error('Failed to send reset email', err);
          reject();
        });
    });
  },
  resetPassword(context, data) {
    return new Promise((resolve, reject) => {
      axios.post(URLS.RESET_API_URL, data)
        .then(() => {
          console.info('Reset password');
          resolve()
        })
        .catch((err) => {
          console.error('Failed to reset password', err.response.data);
          reject(err.response.data.message);
        });
    });
  },
  updateProfile({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      axios.put(URLS.USERS_URL + data.id, data)
        .then((response) => {
          console.info('Updated profile');

          // Only login if user is updating their own profile
          if (state.profile.id == data.id) {
            console.info('Logging in');
            commit(types.LOGIN, response.data);
          }

          resolve();
        })
        .catch((err) => {
          console.error('Failed to update profile');
          reject(err.response.data.message);
        })
    });
  },
  logout({ commit }) {
    console.info('Logging out');
    commit(types.LOGOUT);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
