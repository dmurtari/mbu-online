import {
  shallowMount,
  createLocalVue
} from '@vue/test-utils';
import Vuex from 'vuex';
import chai, { expect } from 'chai'
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import OfferingList from './OfferingList.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
chai.use(sinonChai);

describe('OfferingList.vue', () => {
  let wrapper, getters, store, actions, expectedOfferings;

  beforeEach(() => {
    expectedOfferings = [{
      badge_id: '1',
      name: 'Badge 1',
      periods: [1, 2],
      duration: 1,
      price: undefined,
      requirements: ['1', '2'],
      size_limit: 10
    },
    {
      badge_id: '2',
      name: 'Badge 2',
      periods: undefined,
      duration: undefined,
      price: undefined,
      requirements: undefined,
      size_limit: undefined
    },
    {
      badge_id: '3',
      name: 'Badge 3',
      periods: [2, 3],
      duration: 2,
      price: 10,
      requirements: ['1a'],
      size_limit: 20
    }
  ];

    actions = {
      getEvents: sinon.stub(),
      getCurrentEvent: sinon.stub(),
      getBadges: sinon.stub()
    };

    getters = {
      badgeIdsAndNames: () => {
        return [{
            id: '1',
            name: 'Badge 1'
          },
          {
            id: '2',
            name: 'Badge 2'
          },
          {
            id: '3',
            name: 'Badge 3'
          }
        ]
      },
      // eslint-disable-next-line no-unused-vars
      offeringsForEvent: (eventId) => {
        return () => {
          return [{
              details: {
                badge_id: '1',
                periods: [1, 2],
                duration: 1,
                requirements: ['1', '2'],
                size_limit: 10
              }
            },
            {
              details: {
                badge_id: '3',
                periods: [2, 3],
                duration: 2,
                price: 10,
                requirements: ['1a'],
                size_limit: 20
              }
            }
          ]
        }
      }
    };

    store = new Vuex.Store({
      actions,
      getters
    });

    wrapper = shallowMount(OfferingList, {
      localVue,
      store,
    });
  });

  it('should have gotten events', () => {
    expect(actions.getEvents).to.have.been.called;
  });

  it('should have gotten the current event', () => {
    expect(actions.getCurrentEvent).to.have.been.called;
  });

  it('should have gotten badges', () => {
    expect(actions.getBadges).to.have.been.called;
  });

  it('should default to not filtering badges', () => {
    expect(wrapper.vm.offeredFilter).to.equal('all');
  });

  describe('when an event is selected', () => {
    beforeEach(() => {
      wrapper.setData({ eventId: '1', loading: false, eventLoading: false })
    });

    it('should show all badges', () => {
      expect(wrapper.vm.filteredOfferings).to.have.lengthOf(3);
    });

    it('should compute a list of offered badges', () => {
      expect(wrapper.vm.offeringList).to.deep.equal(expectedOfferings);
    });

    describe('filtering for offered badges', () => {
      beforeEach(() => {
        wrapper.setData({ offeredFilter: 'offered' });
      });

      it('should show only offered badges', () => {
        expect(wrapper.vm.filteredOfferings).to.have.lengthOf(2);
      });

      it('should contain the offered badges', () => {
        console.info(wrapper.vm.filteredOfferings);
        expect(wrapper.vm.filteredOfferings).to.deep.include(expectedOfferings[0]);
        expect(wrapper.vm.filteredOfferings).to.deep.include(expectedOfferings[2]);
      });

      it('should not contain the unoffered badge', () => {
        expect(wrapper.vm.filteredOfferings).not.to.deep.include(expectedOfferings[1]);
      });
    });

    describe('filtering for unoffered badges', () => {
      beforeEach(() => {
        wrapper.setData({ offeredFilter: 'unoffered' });
      });

      it('should show only offered badges', () => {
        expect(wrapper.vm.filteredOfferings).to.have.lengthOf(1);
      });

      it('should not contain the offered badges', () => {
        expect(wrapper.vm.filteredOfferings).not.to.deep.contain(expectedOfferings[0]);
        expect(wrapper.vm.filteredOfferings).not.to.deep.contain(expectedOfferings[2]);
      });

      it('should contain the unoffered badge', () => {
        expect(wrapper.vm.filteredOfferings).to.deep.include(expectedOfferings[1]);
      });
    });
  });
});
