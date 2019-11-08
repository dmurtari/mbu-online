import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import { expect } from 'chai'

import Detail from './Detail.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Event Detail.vue', () => {
  let wrapper, getters, store;

  beforeEach(() => {
    getters = {
      isAdmin: () => true
    }

    store = new Vuex.Store({
      getters
    });

    wrapper = shallowMount(Detail, {
      localVue,
      store,
      propsData: {
        event: {}
      }
    });
  });

  it('should create', () => {
    expect(wrapper.isVueInstance()).to.be.true;
  });

});
