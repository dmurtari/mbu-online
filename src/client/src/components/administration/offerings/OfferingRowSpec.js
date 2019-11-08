import {
  shallowMount,
  createLocalVue
} from '@vue/test-utils';
import Vuex from 'vuex';
import { expect } from 'chai'

import OfferingRow from './OfferingRow.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('OfferingRow.vue', () => {
  let wrapper, getters, store;

  describe('when authenticated as an admin', () => {
    beforeEach(() => {
      getters = {
        isAdmin: () => true
      };

      store = new Vuex.Store({
        getters
      });

      wrapper = shallowMount(OfferingRow, {
        localVue,
        store,
        propsData: {
          badge: {
            duration: 1,
            periods: [1],
            requirements: [1, 2, 3],
            name: 'Badge'
          },
          eventId: '1'
        }
      });
    });

    it('should exist', () => {
      expect(wrapper.isVueInstance()).to.be.true;
    });

    it('should show the edit button', () => {
      expect(wrapper.find('#edit-button').is('button')).to.be.true;
    });

    it('should not show the editing form', () => {
      expect(wrapper.vm.shouldShowEdit).to.be.false;
    });

    it('should not show the edit component', () => {
      expect(wrapper.findAll('offering-edit')).to.have.lengthOf(0);
    });

    it('should show the offering information', () => {
      expect(wrapper.text()).to.contain('Periods offered: 1');
    });

    it('should format the requirements', () => {
      expect(wrapper.text()).to.contain('Requirements: 1, 2, 3');
    });

    describe('and clicking the edit button', () => {
      beforeEach(() => {
        wrapper.find('#edit-button').trigger('click');
      });

      it('should know that is is editing', () => {
        expect(wrapper.vm.editing).to.be.true;
      });

      it('should not be creating', () => {
        expect(wrapper.vm.creating).to.be.false;
      });

      it('should show the editing form', () => {
        expect(wrapper.vm.shouldShowEdit).to.be.true;
      });
    });

    describe('and when the badge is not offered', () => {
      beforeEach(() => {
        wrapper = shallowMount(OfferingRow, {
          localVue,
          store,
          propsData: {
            badge: {
              name: 'Badge'
            },
            eventId: '1'
          }
        });
      });

      it('should not be editing or creating', () => {
        expect(wrapper.vm.editing).to.be.false;
        expect(wrapper.vm.creating).to.be.false;
      });

      it('should not show offering information', () => {
        expect(wrapper.text()).not.to.contain('Periods offered:');
      });

      it('should contain a button to offer the badge', () => {
        expect(wrapper.find('#offer-button').is('button')).to.be.true;
      });

      describe('and clicking the offer button', () => {
        beforeEach(() => {
          wrapper.find('#offer-button').trigger('click');
        });

        it('should know that is is creating', () => {
          expect(wrapper.vm.creating).to.be.true;
        });

        it('should not be editing', () => {
          expect(wrapper.vm.editing).to.be.false;
        });

        it('should show the editing form', () => {
          expect(wrapper.vm.shouldShowEdit).to.be.true;
        });
      });
    });
  });

  describe('when not an admin', () => {
    beforeEach(() => {
      getters = {
        isAdmin: () => false
      };

      store = new Vuex.Store({
        getters
      });

      wrapper = shallowMount(OfferingRow, {
        localVue,
        store,
        propsData: {
          badge: {
            duration: 1,
            periods: [1],
            requirements: [1, 2, 3],
            name: 'Badge'
          },
          eventId: '1'
        }
      });
    });

    it('should not show the edit button', () => {
      expect(wrapper.findAll('#edit-button')).to.have.lengthOf(0);
    });

    it('should show the offering information', () => {
      expect(wrapper.text()).to.contain('Periods offered: 1');
    });

    describe('and the badge is not offered', () => {
      beforeEach(() => {
        wrapper = shallowMount(OfferingRow, {
          localVue,
          store,
          propsData: {
            badge: {
              name: 'Badge'
            },
            eventId: '1'
          }
        });
      });

      it('should not show the offer button', () => {
        expect(wrapper.findAll('#offer-button')).to.have.lengthOf(0);
      });
    });
  });
});
