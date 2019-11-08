import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import {
  shallowMount
} from '@vue/test-utils';
import { expect } from 'chai'
import sinon from 'sinon';

Vue.use(Vuex);

describe('App component', () => {
  let wrapper, store, getters, actions;

  describe('when not authenticated', () => {
    beforeEach(() => {
      getters = {
        isApproved: () => null
      };

      actions = {
        getProfile: sinon.stub().rejects()
      }

      store = new Vuex.Store({
        getters, actions
      });

      wrapper = shallowMount(App, {
        store
      });

      wrapper.setData({ loading: false });
    });

    it('should not display a notification', () => {
      expect(wrapper.findAll('.notification')).to.have.lengthOf(0);
    });
  });

  describe('when authenticated', () => {
    describe('and not approved', () => {
      beforeEach(() => {
        getters = {
          isApproved: () => false
        };

        actions = {
          getProfile: sinon.stub().resolves()
        }

        store = new Vuex.Store({
          getters, actions
        });

        wrapper = shallowMount(App, {
          store
        });

        wrapper.setData({ loading: false });
      });

      it('should show a notification', () => {
        expect(wrapper.findAll('.notification')).to.have.lengthOf(1);
      });
    });

    describe('and approved', () => {
      beforeEach(() => {
        getters = {
          isApproved: () => true
        };

        actions = {
          getProfile: sinon.stub().resolves()
        }

        store = new Vuex.Store({
          getters, actions
        });

        wrapper = shallowMount(App, {
          store
        });

        wrapper.setData({ loading: false });
      });

      it('should not show a notification', () => {
        expect(wrapper.findAll('.notification')).to.have.lengthOf(0);
      });
    });
  });
});
