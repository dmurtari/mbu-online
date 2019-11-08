import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';
import chai from 'chai';
import { expect } from 'chai'
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Edit from './Edit.vue';
chai.use(sinonChai);

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuelidate);

describe('Profile Edit.vue', () => {
  let wrapper, getters, store, actions, $router;

  beforeEach(() => {
    $router = {
      push: sinon.spy()
    };

    actions = {
      updateProfile: sinon.stub().resolves()
    };

    getters = {
      profile: () => {
        return {
          firstname: 'First',
          lastname: 'Last',
          role: 'coordinator',
          details: {}
        };
      }
    };
  });

  describe('when no props are supplied', () => {
    beforeEach(() => {
      store = new Vuex.Store({
        actions,
        getters
      });

      wrapper = shallowMount(Edit, {
        localVue,
        store,
        mocks: {
          $router
        }
      });
    });

    it('should create', () => {
      expect(wrapper.isVueInstance()).to.be.true;
    });

    it('should set the editable profile from the store', () => {
      expect(wrapper.vm.profileUpdate.firstname).to.equal('First');
      expect(wrapper.vm.profileUpdate.lastname).to.equal('Last');
    });

    describe('then saving the changes', () => {
      beforeEach((done) => {
        wrapper.find('#save-profile').trigger('click');
        actions.updateProfile().then(() => done());
      });

      xit('should attempt to route', () => {
        expect(wrapper.vm.$router.push).to.have.been.calledWith('/profile');
      });

      it('should not emit anything', () => {
        expect(wrapper.emitted().done).to.be.undefined;
      });
    });
  });

  describe('when props are supplied', () => {
    beforeEach(() => {
      store = new Vuex.Store({
        actions,
        getters
      });

      wrapper = shallowMount(Edit, {
        localVue,
        store,
        mocks: {
          $router
        },
        propsData: {
          propProfile: {
            firstname: 'Props',
            lastname: 'PropLast'
          },
          routable: false
        }
      });
    });

    it('should create', () => {
      expect(wrapper.isVueInstance()).to.be.true;
    });

    it('should set the editable profile from the prop', () => {
      expect(wrapper.vm.profileUpdate.firstname).to.equal('Props');
      expect(wrapper.vm.profileUpdate.lastname).to.equal('PropLast');
    });

    describe('then saving the changes', () => {
      beforeEach((done) => {
        wrapper.find('#save-profile').trigger('click');
        actions.updateProfile().then(() => done());
      });

      it('should not attempt to route', () => {
        expect(wrapper.vm.$router.push).not.to.have.been.called;
      });

      xit('should emit an event', () => {
        expect(wrapper.emitted().done).not.to.be.undefined;
      });
    });
  });
});
