import {
  shallowMount,
  createLocalVue
} from '@vue/test-utils';
import Vuex from 'vuex';
import Vuelidate from 'vuelidate';
import chai from 'chai';
import { expect } from 'chai'
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import OfferingEdit from './OfferingEdit.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuelidate);
chai.use(sinonChai);

describe('OfferingEdit.vue', () => {
  let wrapper, store, actions;

  beforeEach(() => {
    actions = {
      deleteOffering: sinon.stub(),
      createOffering: sinon.stub(),
      updateOffering: sinon.stub()
    };

    store = new Vuex.Store({
      actions
    });

    wrapper = shallowMount(OfferingEdit, {
      localVue,
      store,
      propsData: {
        badge: {
          badge_id: 2,
          duration: 1,
          periods: [2, 3],
          requirements: [1, 2, 3],
          name: 'Badge'
        },
        eventId: '1'
      }
    });
  });

  it('should be a component', () => {
    expect(wrapper.isVueInstance()).to.be.true;
  });

  it('should default to editing', () => {
    expect(wrapper.vm.creating).to.be.false;
  });

  it('should format the list of periods', () => {
    expect(wrapper.vm.editablePeriods).to.equal('2, 3');
  });

  it('should format the list of requirements', () => {
    expect(wrapper.vm.editableRequirements).to.equal('1, 2, 3');
  });

  it('should parse edited periods', () => {
    wrapper.vm.editablePeriods = '1, 2, 3';
    expect(wrapper.vm.offering.periods).to.deep.equal([1, 2, 3]);
  });

  it('should parse poorly formatted edited periods', () => {
    wrapper.vm.editablePeriods = '1 ,2,3,';
    expect(wrapper.vm.offering.periods).to.deep.equal([1, 2, 3]);
  });

  it('should only parse 3 periods', () => {
    wrapper.vm.editablePeriods = '1, 2, 3, 4';
    expect(wrapper.vm.offering.periods).to.deep.equal([1, 2, 3]);
  });

  it('should parse edited requirements', () => {
    wrapper.vm.editableRequirements = '1, 2, 3a, 4';
    expect(wrapper.vm.offering.requirements).to.deep.equal(['1', '2', '3a', '4']);
  });

  it('should parse poorly formatted edited requirements', () => {
    wrapper.vm.editableRequirements = '1,2 ,3,4';
    expect(wrapper.vm.offering.requirements).to.deep.equal(['1', '2', '3', '4']);
  });

  describe('and then trying to delete the offering', () => {
    beforeEach(() => {
      wrapper.vm.deleteOffering();
    });

    it('should have dispatched the appropriate action', () => {
      expect(actions.deleteOffering).to.have.been.called;
    });

    xit('should have called with the appropriate information', () => {
      expect(actions.deleteOffering).to.have.been.calledWithMatch(
        { eventId: '1', badgeId: 2 }
      )
    });
  });
});
