// import 'babel-polyfill';
import { expect } from 'chai'

import Vue from 'vue';
import Main from './Main.vue';
import Vuex from 'vuex';
import {
  shallowMount
} from '@vue/test-utils';

Vue.use(Vuex);

describe('Main', () => {
  let wrapper, store, getters;

  describe('when logged out', () => {
    beforeEach(() => {
      getters = {
        isAuthenticated: () => false,
        isTeacher: () => false,
        isCoordinator: () => false,
        isAdmin: () => false,
        currentEvent: () => {
          return {
            semester: 'Fall',
            year: '2017'
          }
        }
      };

      store = new Vuex.Store({
        getters
      });
      wrapper = shallowMount(Main, {
        store
      });
    });

    it('should show a welcome message', () => {
      expect(wrapper.findAll('#genericWelcome')).to.have.lengthOf(1);
    });

    it('should show a signup link', () => {
      expect(wrapper.text()).to.contain('signup');
    });

    it('should show a login link', () => {
      expect(wrapper.text()).to.contain('Login');
    });

    it('should not show the admin welcome', () => {
      expect(wrapper.findAll('#adminWelcome')).to.have.lengthOf(0);
    });

    it('should not show the teacher welcome', () => {
      expect(wrapper.findAll('#teacherWelcome')).to.have.lengthOf(0);
    });

    it('should not show the coordinator welcome', () => {
      expect(wrapper.findAll('#coordinatorWelcome')).to.have.lengthOf(0);
    });
  });

  describe('when logged in as an admin', () => {
    beforeEach(() => {
      getters = {
        isAuthenticated: () => true,
        isTeacher: () => false,
        isCoordinator: () => false,
        isAdmin: () => true,
        currentEvent: () => {
          return {
            semester: 'Fall',
            year: '2017'
          }
        }
      };

      store = new Vuex.Store({
        getters
      });
      wrapper = shallowMount(Main, {
        store
      });
    });

    it('should not show the generic welcome message', () => {
      expect(wrapper.findAll('#genericWelcome')).to.have.lengthOf(0);
    });

    it('should show the admin welcome', () => {
      expect(wrapper.findAll('#adminWelcome')).to.have.lengthOf(1);
    });

    it('should not show the teacher welcome', () => {
      expect(wrapper.findAll('#teacherWelcome')).to.have.lengthOf(0);
    });

    it('should not show the coordinator welcome', () => {
      expect(wrapper.findAll('#coordinatorWelcome')).to.have.lengthOf(0);
    });
  });

  describe('when logged in as a teacher', () => {
    beforeEach(() => {
      getters = {
        isAuthenticated: () => true,
        isTeacher: () => true,
        isCoordinator: () => false,
        isAdmin: () => false,
        currentEvent: () => {
          return {
            semester: 'Fall',
            year: '2017'
          }
        }
      };

      store = new Vuex.Store({
        getters
      });
      wrapper = shallowMount(Main, {
        store
      });
    });

    it('should not show the generic welcome message', () => {
      expect(wrapper.findAll('#genericWelcome')).to.have.lengthOf(0);
    });

    it('should not show the admin welcome', () => {
      expect(wrapper.findAll('#adminWelcome')).to.have.lengthOf(0);
    });

    it('should show the teacher welcome', () => {
      expect(wrapper.findAll('#teacherWelcome')).to.have.lengthOf(1);
    });

    it('should not show the coordinator welcome', () => {
      expect(wrapper.findAll('#coordinatorWelcome')).to.have.lengthOf(0);
    });
  });

  describe('when logged in as a coordinator', () => {
    beforeEach(() => {
      getters = {
        isAuthenticated: () => true,
        isTeacher: () => false,
        isCoordinator: () => true,
        isAdmin: () => false,
        currentEvent: () => {
          return {
            semester: 'Fall',
            year: '2017'
          }
        }
      };

      store = new Vuex.Store({
        getters
      });
      wrapper = shallowMount(Main, {
        store
      });
    });

    it('should not show the generic welcome message', () => {
      expect(wrapper.findAll('#genericWelcome')).to.have.lengthOf(0);
    });

    it('should not show the admin welcome', () => {
      expect(wrapper.findAll('#adminWelcome')).to.have.lengthOf(0);
    });

    it('should not show the teacher welcome', () => {
      expect(wrapper.findAll('#teacherWelcome')).to.have.lengthOf(0);
    });

    it('should show the coordinator welcome', () => {
      expect(wrapper.findAll('#coordinatorWelcome')).to.have.lengthOf(1);
    });
  });
});
